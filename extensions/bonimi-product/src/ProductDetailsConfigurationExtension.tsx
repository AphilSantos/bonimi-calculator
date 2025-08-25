import {
  reactExtension,
  useApi,
  BlockStack,
  Text,
  TextField,
  Button,
  InlineStack,
  Divider,
  Badge
} from '@shopify/ui-extensions-react/admin';
import {useState, useEffect} from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
export default reactExtension('admin.product-details.configuration.render', () => <App />);

function App() {
  const {extension: {target}, i18n} = useApi<'admin.product-details.configuration.render'>();
  
  const product = useProduct();
  const [calculator, setCalculator] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  // Mock calculator data - in real app, this would come from your app's database
  useEffect(() => {
    if (product) {
      // Check if this product has a calculator assigned
      setCalculator({
        id: 1,
        name: 'Furniture Dimensions Calculator',
        fields: [
          { name: 'length', label: 'Length (cm)', type: 'number', required: true },
          { name: 'width', label: 'Width (cm)', type: 'number', required: true },
          { name: 'height', label: 'Height (cm)', type: 'number', required: true }
        ],
        formula: 'basePrice + (length * width * height * 0.01)',
        basePrice: 100
      });
    }
  }, [product]);

  const handleFieldChange = (fieldName, value) => {
    const newValues = { ...formValues, [fieldName]: value };
    setFormValues(newValues);
    
    // Calculate price when all required fields are filled
    if (calculator && calculator.fields.every(field => 
      !field.required || newValues[field.name]
    )) {
      const price = calculatePrice(calculator, newValues, product?.price);
      setCalculatedPrice(price);
    }
  };

  const calculatePrice = (calc, values, basePrice) => {
    try {
      // Simple formula evaluation - in production, use a proper math parser
      let formula = calc.formula;
      let result = basePrice || calc.basePrice;
      
      // Replace variables with actual values
      Object.keys(values).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        formula = formula.replace(regex, values[key] || 0);
      });
      
      // Basic evaluation (simplified - use mathjs or similar in production)
      if (formula.includes('*')) {
        const parts = formula.split('*');
        result = parts.reduce((acc, part) => acc * parseFloat(part.trim()), 1);
      }
      
      return Math.round(result * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Price calculation error:', error);
      return basePrice || calc.basePrice;
    }
  };

  const handleAddToCart = () => {
    if (calculatedPrice && Object.keys(formValues).length > 0) {
      // In a real app, this would trigger the cart modification
      console.log('Adding to cart with:', {
        productId: product?.id,
        calculatedPrice,
        configuration: formValues
      });
      
      // Show success message
      alert(`Product added to cart! Price: $${calculatedPrice}`);
    }
  };

  if (!product || !calculator) {
    return (
      <BlockStack>
        <Text>No calculator configured for this product.</Text>
      </BlockStack>
    );
  }

  return (
    <BlockStack gap="400">
      <BlockStack gap="300" padding="400" background="surface">
        <Text variant="headingMd" as="h3">
          {calculator.name}
        </Text>
        
        <Divider />
        
        <BlockStack gap="300">
          {calculator.fields.map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              type={field.type}
              value={formValues[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              required={field.required}
              helpText={field.helpText}
            />
          ))}
        </BlockStack>

        {calculatedPrice && (
          <BlockStack gap="200">
            <Divider />
            <InlineStack align="space-between">
              <Text variant="bodyMd">Calculated Price:</Text>
              <Text variant="headingMd" as="strong">
                ${calculatedPrice}
              </Text>
            </InlineStack>
            
            <Button
              primary
              fullWidth
              onPress={handleAddToCart}
              disabled={!calculatedPrice}
            >
              Add to Cart - ${calculatedPrice}
            </Button>
          </BlockStack>
        )}
      </BlockStack>
    </BlockStack>
  );
}

function useProduct() {
  const {data, query} = useApi<'admin.product-details.configuration.render'>();
  const productId = (data as any)?.selected[0].id;
  const [product, setProduct] = useState<{
    id: string;
    title: string;
    price: number;
    bundleComponents: {
      id: string;
      title: string;
    }[];
  }>(null);
  

  useEffect(() => {
    if (productId) {
      query(
        `#graphql
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            bundleComponents(first: 100) {
              nodes {
                componentProduct {
                  id
                  title
                }
              }
            }
          }
        }
        `,
        {variables: {id: productId}}
      ).then(({data, errors}) => {
        if (errors) {
          console.error(errors);
        } else {
          const productData = (data as any).product;
          setProduct({
            id: productData.id,
            title: productData.title,
            price: parseFloat(productData.priceRangeV2?.minVariantPrice?.amount || '0'),
            bundleComponents: productData.bundleComponents?.nodes?.map(({componentProduct}) => ({
              ...componentProduct
            })) || []
          });
        }
      });
    }
  }, [productId, query]);

  return product;
}