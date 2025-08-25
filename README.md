# Bonimi Calculator - Custom Product Pricing App

## 🎯 What is Bonimi Calculator?

**Bonimi Calculator** is a Shopify app that enables custom product pricing and personalization for businesses that offer customizable products. It's specifically designed for companies like yours that deal with custom kitchen splashbacks, glass panels, and other personalized kitchen products.

### 🏢 Business Use Case
- **Custom Kitchen Splashbacks**: Calculate pricing based on dimensions, materials, and installation
- **Glass Panels**: Price based on size, glass type, edge finishing, and mounting hardware
- **Custom Shelving**: Pricing for dimensions, materials, brackets, and installation
- **Any Customizable Product**: Flexible calculator system for various business needs

## ✨ Key Features

### For Shop Owners
- **Create Custom Calculators**: Build pricing formulas for different product types
- **Define Input Fields**: Set up customer input fields (dimensions, materials, options)
- **Flexible Formulas**: Use mathematical expressions with variables and operators
- **Product Association**: Link calculators to specific Shopify products
- **Real-time Management**: Add, edit, and delete calculators through admin interface

### For Customers
- **Personalized Products**: Configure products with custom specifications
- **Real-time Pricing**: See price updates as they adjust options
- **Easy Configuration**: Simple interface for entering dimensions and preferences
- **Seamless Checkout**: Add custom products to cart with calculated prices

## 🏗️ Technical Architecture

### Frontend
- **React.js** with modern hooks and functional components
- **Shopify Polaris** design system for consistent UI/UX
- **App Bridge v4** for Shopify integration
- **React Query** for efficient data fetching and state management

### Backend
- **Node.js/Express** server
- **Shopify API** integration for authentication and webhooks
- **SQLite** database for session storage
- **RESTful API** endpoints for calculator management

### Extensions
- **Cart & Checkout Extension**: Custom validation and pricing
- **Product Extension**: Enhanced product pages with calculators

## 📊 Current Progress

### ✅ Completed Features
1. **App Infrastructure**
   - Shopify app setup and authentication
   - App Bridge v4 integration
   - Basic routing and navigation
   - Provider system for app context

2. **Calculator Management System**
   - Create, read, update, delete calculators
   - Formula builder with field definitions
   - Admin interface for managing calculators
   - Backend API endpoints

3. **Product Integration Foundation**
   - ProductsCard component for basic product management
   - API endpoints for product creation and counting
   - Basic product population functionality

4. **UI Components**
   - Modern Polaris-based interface
   - Responsive design
   - Modal forms for calculator creation/editing
   - Data tables for calculator management

### 🚧 In Progress
1. **Customer-Facing Calculator Interface**
   - Real-time price calculation engine
   - Dynamic form generation based on calculator configuration
   - Price display and updates

2. **Product-Calculator Association**
   - Link calculators to specific Shopify products
   - Product page integration
   - Calculator selection based on product type

### 📋 Next Steps
1. **Price Calculation Engine**
   - Formula parser and evaluator
   - Variable substitution and validation
   - Real-time calculation updates

2. **Customer Experience**
   - Calculator widget on product pages
   - Mobile-responsive calculator interface
   - Price history and comparison

3. **Cart Integration**
   - Custom product variants in cart
   - Price validation and updates
   - Checkout process integration

4. **Advanced Features**
   - Material cost databases
   - Installation pricing
   - Bulk pricing and discounts
   - Customer quote generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Shopify Partner account
- Development store

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd bonimi-calculator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Shopify app credentials

# Start development server
shopify app dev
```

### Development Commands
```bash
# Start development server
shopify app dev

# Build for production
shopify app build

# Deploy to Shopify
shopify app deploy
```

## 🔧 Configuration

### Calculator Formula Examples
```
# Basic dimension-based pricing
basePrice + (length * width * pricePerSqm)

# Material-based pricing
basePrice + (length * width * materialMultiplier) + installationCost

# Complex pricing with options
basePrice + (length * width * basePricePerSqm) + (edgeFinishing * perimeter) + mountingHardware
```

### Field Types Supported
- **Number**: Dimensions, quantities, measurements
- **Select**: Material types, finishes, options
- **Text**: Custom specifications, notes
- **Boolean**: Yes/no options, features

## 📱 App Structure

```
bonimi-calculator/
├── web/                          # Main app backend
│   ├── frontend/                 # React frontend
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # App pages
│   │   └── providers/            # Context providers
│   ├── models/                   # Data models
│   └── index.js                  # Express server
├── extensions/                    # Shopify app extensions
│   ├── bonimi-cart-and-checkout/ # Cart validation
│   └── bonimi-product/           # Product page enhancements
└── README.md                     # This file
```

## 🤝 Contributing

This is a custom app for your business. To contribute:
1. Understand your specific business requirements
2. Test thoroughly with your product catalog
3. Ensure pricing accuracy and validation
4. Maintain Shopify best practices

## 📄 License

This is a proprietary application for your business use. All rights reserved.

## 📞 Support

For questions or issues:
- Check the Shopify app documentation
- Review the code comments and structure
- Test with your development store first

---

**Built with ❤️ for custom kitchen and glass products business**
