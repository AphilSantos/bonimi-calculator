// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import Calculator from "./models/Calculator.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Database setup
let db;

async function initializeDatabase() {
  try {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    
    // Create calculators table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS calculators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        formula TEXT NOT NULL,
        elements TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create sample_data table for shop admin configuration
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value REAL NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default sample data if none exists
    const sampleDataCount = await db.get("SELECT COUNT(*) as count FROM sample_data");
    if (sampleDataCount.count === 0) {
      await db.exec(`
        INSERT INTO sample_data (key, value, label, description) VALUES
        ('basePrice', 50, 'Base Price (£)', 'Starting price for calculations'),
        ('pricePerSqm', 150, 'Price per m² (£)', 'Price per square meter'),
        ('materialMultiplier', 1.2, 'Material Multiplier', 'Material cost multiplier'),
        ('installationCost', 25, 'Installation Cost (£)', 'Additional installation cost')
      `);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// Calculator API endpoints
app.get("/api/calculators", async (_req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const calculators = await db.all("SELECT * FROM calculators ORDER BY createdAt DESC");
    
    // Parse elements JSON for each calculator
    const parsedCalculators = calculators.map(calc => ({
      ...calc,
      elements: JSON.parse(calc.elements || '[]')
    }));
    
    res.status(200).json(parsedCalculators);
  } catch (error) {
    console.error('Failed to fetch calculators:', error);
    res.status(500).json({ error: 'Failed to fetch calculators' });
  }
});

app.post("/api/calculators", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const { name, description, formula, elements, status = 'active' } = req.body;
    
    if (!name || !formula || !elements) {
      return res.status(400).json({ error: 'Name, formula, and elements are required' });
    }
    
    const result = await db.run(
      "INSERT INTO calculators (name, description, formula, elements, status) VALUES (?, ?, ?, ?, ?)",
      [name, description, formula, JSON.stringify(elements), status]
    );
    
    const newCalculator = await db.get("SELECT * FROM calculators WHERE id = ?", result.lastID);
    newCalculator.elements = JSON.parse(newCalculator.elements);
    
    res.status(201).json({ 
      success: true, 
      calculator: newCalculator 
    });
  } catch (error) {
    console.error('Failed to create calculator:', error);
    res.status(500).json({ error: 'Failed to create calculator' });
  }
});

app.get("/api/calculators/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const { id } = req.params;
    const calculator = await db.get("SELECT * FROM calculators WHERE id = ?", id);
    
    if (!calculator) {
      return res.status(404).json({ error: 'Calculator not found' });
    }
    
    calculator.elements = JSON.parse(calculator.elements);
    res.status(200).json(calculator);
  } catch (error) {
    console.error('Failed to fetch calculator:', error);
    res.status(500).json({ error: 'Failed to fetch calculator' });
  }
});

app.put("/api/calculators/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const { id } = req.params;
    const { name, description, formula, elements, status } = req.body;
    
    if (!name || !formula || !elements) {
      return res.status(400).json({ error: 'Name, formula, and elements are required' });
    }
    
    await db.run(
      "UPDATE calculators SET name = ?, description = ?, formula = ?, elements = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [name, description, formula, JSON.stringify(elements), status, id]
    );
    
    const updatedCalculator = await db.get("SELECT * FROM calculators WHERE id = ?", id);
    updatedCalculator.elements = JSON.parse(updatedCalculator.elements);
    
    res.status(200).json({ 
      success: true, 
      calculator: updatedCalculator 
    });
  } catch (error) {
    console.error('Failed to update calculator:', error);
    res.status(500).json({ error: 'Failed to update calculator' });
  }
});

app.delete("/api/calculators/:id", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const { id } = req.params;
    await db.run("DELETE FROM calculators WHERE id = ?", id);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to delete calculator:', error);
    res.status(500).json({ error: 'Failed to delete calculator' });
  }
});

// Sample data API endpoints for shop admin configuration
app.get("/api/sample-data", async (_req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const sampleData = await db.all("SELECT * FROM sample_data ORDER BY key");
    res.status(200).json(sampleData);
  } catch (error) {
    console.error('Failed to fetch sample data:', error);
    res.status(500).json({ error: 'Failed to fetch sample data' });
  }
});

app.put("/api/sample-data/:key", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    
    const { key } = req.params;
    const { value, label, description } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    await db.run(
      "UPDATE sample_data SET value = ?, label = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?",
      [value, label, description, key]
    );
    
    const updatedData = await db.get("SELECT * FROM sample_data WHERE key = ?", key);
    res.status(200).json({ 
      success: true, 
      sampleData: updatedData 
    });
  } catch (error) {
    console.error('Failed to update sample data:', error);
    res.status(500).json({ error: 'Failed to update sample data' });
  }
});

app.post("/api/calculators/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // In production, update database assignment
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to assign calculator:', error);
    res.status(500).json({ error: 'Failed to assign calculator' });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
