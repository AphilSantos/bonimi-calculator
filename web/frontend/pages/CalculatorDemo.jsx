import React, { useState, useEffect } from 'react';
import { Page, Layout, LegacyCard, Text, VerticalStack, Button, Select } from '@shopify/polaris';
import { CustomerCalculator } from '../components/CustomerCalculator';
import { getCalculatorsForDisplay } from '../utils/calculatorDataTransform';

export default function CalculatorDemo() {
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [basePrice, setBasePrice] = useState(50);
  const [calculators, setCalculators] = useState([]);

  // Load calculators from localStorage
  useEffect(() => {
    try {
      const displayCalculators = getCalculatorsForDisplay();
      console.log('CalculatorDemo: Loaded calculators from localStorage (transformed):', displayCalculators);
      setCalculators(displayCalculators);
    } catch (error) {
      console.error('CalculatorDemo: Failed to load calculators from localStorage:', error);
      setCalculators([]);
    }
  }, []);

  // Listen for storage changes to refresh calculators when new ones are saved
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bonimi_calculators') {
        try {
          const displayCalculators = getCalculatorsForDisplay();
          console.log('CalculatorDemo: Storage changed, reloading calculators:', displayCalculators);
          setCalculators(displayCalculators);
        } catch (error) {
          console.error('CalculatorDemo: Failed to reload calculators after storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sample calculators for testing
  const sampleCalculators = [
    {
      id: 1,
      name: 'Kitchen Splashback Calculator',
      description: 'Calculate pricing for custom kitchen splashbacks based on dimensions and materials',
      formula: 'basePrice + (length * width * 0.15) + (materialMultiplier * length * width)',
      fields: [
        { name: 'length', label: 'Length (cm)', type: 'number', required: true, helpText: 'Enter the length in centimeters' },
        { name: 'width', label: 'Height (cm)', type: 'number', required: true, helpText: 'Enter the height in centimeters' },
        { 
          name: 'materialMultiplier', 
          label: 'Material Type', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Standard Glass', value: 0.05 },
            { label: 'Tempered Glass', value: 0.08 },
            { label: 'Premium Glass', value: 0.12 },
            { label: 'Mirror Finish', value: 0.15 }
          ],
          helpText: 'Select your preferred material type'
        }
      ],
      status: 'active'
    },
    {
      id: 2,
      name: 'Glass Panel Calculator',
      description: 'Price calculation for custom glass panels with edge finishing options',
      formula: 'basePrice + (length * width * 0.10) + (edgeFinishing * (2 * length + 2 * width))',
      fields: [
        { name: 'length', label: 'Length (cm)', type: 'number', required: true },
        { name: 'width', label: 'Width (cm)', type: 'number', required: true },
        { 
          name: 'edgeFinishing', 
          label: 'Edge Finishing', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Standard Edge', value: 0.50 },
            { label: 'Polished Edge', value: 1.00 },
            { label: 'Beveled Edge', value: 1.50 },
            { label: 'Custom Edge', value: 2.00 }
          ]
        }
      ],
      status: 'active'
    },
    {
      id: 3,
      name: 'Custom Shelving Calculator',
      description: 'Pricing for custom shelving units with material and bracket options',
      formula: 'basePrice + (length * depth * materialCost) + (bracketCost * numberOfBrackets)',
      fields: [
        { name: 'length', label: 'Length (cm)', type: 'number', required: true },
        { name: 'depth', label: 'Depth (cm)', type: 'number', required: true },
        { 
          name: 'materialCost', 
          label: 'Material', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Pine Wood', value: 0.08 },
            { label: 'Oak Wood', value: 0.15 },
            { label: 'MDF', value: 0.06 },
            { label: 'Plywood', value: 0.10 }
          ]
        },
        { name: 'numberOfBrackets', label: 'Number of Brackets', type: 'number', required: true, helpText: 'Minimum 2 brackets required' }
      ],
      status: 'active'
    }
  ];

  // Use saved calculators if available, otherwise fall back to sample calculators
  const availableCalculators = calculators.length > 0 ? calculators : sampleCalculators;

  const handleCalculatorSelect = (value) => {
    const calculator = availableCalculators.find(calc => calc.id === parseInt(value) || calc.id === value);
    setSelectedCalculator(calculator);
  };

  const handleAddToCart = (configuration) => {
    console.log('Adding to cart:', configuration);
    // Here you would integrate with Shopify's cart API
    alert(`Product added to cart!\n\nConfiguration: ${JSON.stringify(configuration, null, 2)}`);
  };

  const handleBasePriceChange = (value) => {
    setBasePrice(parseFloat(value) || 0);
  };

  return (
    <Page
      title="Calculator Demo"
      subtitle="Test the custom pricing calculator functionality"
    >
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <VerticalStack gap="4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text variant="headingMd" as="h3">
                    Test Your Calculators
                  </Text>
                  <Text variant="bodyMd" as="p" color="subdued">
                    Select a calculator and configure your custom product to see real-time pricing
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    onClick={() => {
                      try {
                        const displayCalculators = getCalculatorsForDisplay();
                        console.log('Manual refresh: Loaded calculators:', displayCalculators);
                        setCalculators(displayCalculators);
                      } catch (error) {
                        console.error('Manual refresh failed:', error);
                      }
                    }}
                  >
                    Refresh Calculators
                  </Button>
                  <Button
                    primary
                    url="/calculatorBuilder"
                    external
                  >
                    Create New Calculator
                  </Button>
                </div>
              </div>

              <div>
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  Base Price (GBP)
                </Text>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => handleBasePriceChange(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #c9cccf',
                    borderRadius: '4px',
                    fontSize: '16px',
                    width: '120px'
                  }}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  Select Calculator
                </Text>
                <Select
                  options={[
                    { label: 'Choose a calculator...', value: '' },
                    ...availableCalculators.map(calc => ({
                      label: calc.name,
                      value: calc.id.toString()
                    }))
                  ]}
                  value={selectedCalculator ? selectedCalculator.id.toString() : ''}
                  onChange={handleCalculatorSelect}
                  placeholder="Select a calculator to test"
                />
              </div>

              {selectedCalculator && (
                <div>
                  <Text variant="bodyMd" as="p" fontWeight="semibold">
                    Calculator Details
                  </Text>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f6f6f7', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <p><strong>Formula:</strong> {selectedCalculator.formula}</p>
                    <p><strong>Fields:</strong> {selectedCalculator.fields.map(f => f.label).join(', ')}</p>
                  </div>
                </div>
              )}
            </VerticalStack>
          </LegacyCard>
        </Layout.Section>

        {selectedCalculator && (
          <Layout.Section>
            <CustomerCalculator
              calculator={selectedCalculator}
              basePrice={basePrice}
              onAddToCart={handleAddToCart}
              productTitle={selectedCalculator.name.replace(' Calculator', '')}
            />
          </Layout.Section>
        )}

        <Layout.Section>
          <LegacyCard sectioned>
            <VerticalStack gap="4">
              <Text variant="headingMd" as="h3">
                How It Works
              </Text>
              <div>
                <Text variant="bodyMd" as="p">
                  1. <strong>Select a Calculator:</strong> Choose from predefined calculators for different product types
                </Text>
                <Text variant="bodyMd" as="p">
                  2. <strong>Configure Your Product:</strong> Enter dimensions, select materials, and choose options
                </Text>
                <Text variant="bodyMd" as="p">
                  3. <strong>Real-time Pricing:</strong> See price updates as you adjust specifications
                </Text>
                <Text variant="bodyMd" as="p">
                  4. <strong>Add to Cart:</strong> Purchase your custom configured product
                </Text>
              </div>
            </VerticalStack>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
