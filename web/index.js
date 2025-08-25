// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

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
    // In production, fetch from database
    const calculators = [
      new Calculator({
        id: 1,
        name: 'Furniture Dimensions Calculator',
        description: 'Calculate price based on length, width, and height',
        formula: 'basePrice + (length * width * height * 0.01)',
        fields: [
          { name: 'length', label: 'Length (cm)', type: 'number', required: true },
          { name: 'width', label: 'Width (cm)', type: 'number', required: true },
          { name: 'height', label: 'Height (cm)', type: 'number', required: true }
        ],
        productIds: ['product1', 'product2'],
        status: 'active'
      })
    ];
    
    res.status(200).json(calculators.map(calc => calc.getConfig()));
  } catch (error) {
    console.error('Failed to fetch calculators:', error);
    res.status(500).json({ error: 'Failed to fetch calculators' });
  }
});

app.post("/api/calculators", async (req, res) => {
  try {
    const calculator = new Calculator(req.body);
    const errors = calculator.validate();
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // In production, save to database
    // For now, just return success
    res.status(201).json({ 
      success: true, 
      calculator: calculator.getConfig() 
    });
  } catch (error) {
    console.error('Failed to create calculator:', error);
    res.status(500).json({ error: 'Failed to create calculator' });
  }
});

app.get("/api/calculators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, fetch from database
    const calculator = new Calculator({
      id: parseInt(id),
      name: 'Furniture Dimensions Calculator',
      description: 'Calculate price based on length, width, and height',
      formula: 'basePrice + (length * width * height * 0.01)',
      fields: [
        { name: 'length', label: 'Length (cm)', type: 'number', required: true },
        { name: 'width', label: 'Width (cm)', type: 'number', required: true },
        { name: 'height', label: 'Height (cm)', type: 'number', required: true }
      ],
      status: 'active'
    });
    
    res.status(200).json(calculator.getConfig());
  } catch (error) {
    console.error('Failed to fetch calculator:', error);
    res.status(500).json({ error: 'Failed to fetch calculator' });
  }
});

app.put("/api/calculators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const calculator = new Calculator({ ...req.body, id: parseInt(id) });
    const errors = calculator.validate();
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // In production, update in database
    res.status(200).json({ 
      success: true, 
      calculator: calculator.getConfig() 
    });
  } catch (error) {
    console.error('Failed to update calculator:', error);
    res.status(500).json({ error: 'Failed to update calculator' });
  }
});

app.delete("/api/calculators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, delete from database
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to delete calculator:', error);
    res.status(500).json({ error: 'Failed to delete calculator' });
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
