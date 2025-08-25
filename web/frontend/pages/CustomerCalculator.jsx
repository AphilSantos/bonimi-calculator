import React, { useState, useEffect } from 'react';
import { 
  LegacyCard, 
  Text, 
  VerticalStack, 
  Button, 
  TextField, 
  Select,
  Badge,
  Divider,
  Spinner,
  Toast,
  EmptyState
} from '@shopify/polaris';
import { 
  AnalyticsMinor,
  AlertMinor,
  PlusMinor
} from '@shopify/polaris-icons';
import { getCalculatorsForDisplay } from '../utils/calculatorDataTransform';

export default function CustomerCalculator() {
  // State for calculator selection and data
  const [calculators, setCalculators] = useState([]);
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [formData, setFormData] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Load saved calculators on component mount
  useEffect(() => {
    loadCalculators();
  }, []);

  // Listen for storage changes to refresh calculators when new ones are saved
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bonimi_calculators') {
        console.log('CustomerCalculator page: Storage changed, reloading calculators');
        loadCalculators();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load calculators from localStorage
  const loadCalculators = () => {
    try {
      const displayCalculators = getCalculatorsForDisplay();
      setCalculators(displayCalculators);
      
      // If no calculators exist, create a demo calculator
      if (displayCalculators.length === 0) {
        createDemoCalculator();
      }
    } catch (error) {
      console.error('Error loading calculators:', error);
      createDemoCalculator();
    }
  };

  // Create a demo calculator if none exist
  const createDemoCalculator = () => {
    const demoCalculator = {
      id: 'demo_calc',
      name: 'Kitchen Splashback Calculator',
      description: 'Calculate the price for your custom kitchen splashback',
      elements: [
        {
          id: 'length',
          type: 'number-input',
          label: 'Length (cm)',
          placeholder: 'Enter length',
          required: true,
          min: 10,
          max: 500,
          step: 1
        },
        {
          id: 'width',
          type: 'number-input',
          label: 'Width (cm)',
          placeholder: 'Enter width',
          required: true,
          min: 10,
          max: 500,
          step: 1
        },
        {
          id: 'material',
          type: 'select',
          label: 'Material Type',
          options: [
            { label: 'Standard Glass', value: 'standard' },
            { label: 'Premium Glass', value: 'premium' },
            { label: 'Tempered Glass', value: 'tempered' },
            { label: 'Acrylic', value: 'acrylic' }
          ],
          required: true
        },
        {
          id: 'edge-finishing',
          type: 'select',
          label: 'Edge Finishing',
          options: [
            { label: 'Standard Edge', value: 'standard' },
            { label: 'Polished Edge', value: 'polished' },
            { label: 'Beveled Edge', value: 'beveled' }
          ],
          required: true
        },
        {
          id: 'quantity',
          type: 'number-input',
          label: 'Quantity',
          placeholder: 'Enter quantity',
          required: true,
          min: 1,
          max: 10,
          step: 1
        }
      ],
      formula: 'basePrice + (length * width * 0.15) + (materialMultiplier * length * width) + (edgeMultiplier * length * width)',
      basePrice: 50,
      materialMultipliers: {
        'standard': 0.8,
        'premium': 1.2,
        'tempered': 1.5,
        'acrylic': 0.6
      },
      edgeMultipliers: {
        'standard': 1.0,
        'polished': 1.3,
        'beveled': 1.6
      }
    };
    
    setCalculators([demoCalculator]);
    setSelectedCalculator(demoCalculator);
    initializeFormData(demoCalculator);
  };

  // Initialize form data when calculator is selected
  useEffect(() => {
    if (selectedCalculator) {
      initializeFormData(selectedCalculator);
      setCalculatedPrice(null);
      setErrors({});
    }
  }, [selectedCalculator]);

  // Initialize form data
  const initializeFormData = (calculator) => {
    const initialData = {};
    calculator.elements.forEach(element => {
      if (element.type === 'select') {
        initialData[element.id] = element.options[0]?.value || '';
      } else if (element.type === 'number-input') {
        initialData[element.id] = '';
      }
    });
    setFormData(initialData);
  };

  // Handle calculator selection
  const handleCalculatorSelect = (calculator) => {
    console.log('CustomerCalculator: Selected calculator:', calculator);
    console.log('CustomerCalculator: Calculator elements:', calculator.elements);
    console.log('CustomerCalculator: Calculator fields:', calculator.fields);
    setSelectedCalculator(calculator);
  };

  // Handle input changes
  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!selectedCalculator) return false;
    
    const newErrors = {};
    
    // Support both elements (CalculatorBuilder format) and fields (other pages format)
    const elementsToValidate = selectedCalculator.elements || selectedCalculator.fields || [];
    elementsToValidate.forEach(element => {
      const elementId = element.id || element.name;
      const elementLabel = element.label;
      const elementType = element.type;
      const elementRequired = element.required;
      
      if (elementRequired) {
        const value = formData[elementId];
        if (!value || value === '') {
          newErrors[elementId] = `${elementLabel} is required`;
        } else if (elementType === 'number-input' || elementType === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            newErrors[elementId] = `${elementLabel} must be a valid number`;
          } else if (element.min && numValue < element.min) {
            newErrors[elementId] = `${elementLabel} must be at least ${element.min}`;
          } else if (element.max && numValue > element.max) {
            newErrors[elementId] = `${elementLabel} must be no more than ${element.max}`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate price
  const calculatePrice = () => {
    if (!selectedCalculator || !validateForm()) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const { length, width, material, 'edge-finishing': edgeFinishing, quantity } = formData;
        
        // Get multipliers
        const materialMultiplier = selectedCalculator.materialMultipliers?.[material] || 1;
        const edgeMultiplier = selectedCalculator.edgeMultipliers?.[edgeFinishing] || 1;
        
        // Calculate area in square meters
        const area = (length * width) / 10000; // Convert cm² to m²
        
        // Apply formula
        const price = (
          (selectedCalculator.basePrice || 50) + 
          (area * 1500) + // Base area cost
          (area * 1500 * materialMultiplier) + // Material cost
          (area * 1500 * edgeMultiplier) // Edge finishing cost
        ) * quantity;
        
        setCalculatedPrice(price);
        setToastMessage('Price calculated successfully!');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        console.error('Calculation error:', error);
        setToastMessage('Error calculating price. Please check your inputs.');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsCalculating(false);
      }
    }, 1000);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Render form elements
  const renderFormElement = (element) => {
    // Support both elements (CalculatorBuilder format) and fields (other pages format)
    const elementId = element.id || element.name;
    const elementLabel = element.label;
    const elementType = element.type;
    const elementRequired = element.required;
    const elementPlaceholder = element.placeholder;
    const elementMin = element.min;
    const elementMax = element.max;
    const elementStep = element.step;
    
    const error = errors[elementId];
    const value = formData[elementId] || '';

    switch (elementType) {
      case 'number-input':
      case 'number':
        return (
          <TextField
            key={elementId}
            label={elementLabel}
            type="number"
            value={value}
            onChange={(value) => handleInputChange(elementId, value)}
            placeholder={elementPlaceholder}
            min={elementMin}
            max={elementMax}
            step={elementStep}
            error={error}
            required={elementRequired}
          />
        );

      case 'select':
        return (
          <Select
            key={elementId}
            label={elementLabel}
            options={element.options || []}
            value={value}
            onChange={(value) => handleInputChange(elementId, value)}
            error={error}
            required={elementRequired}
          />
        );

      default:
        return null;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePrice();
  };

  // If no calculators exist, show empty state
  if (calculators.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <EmptyState
          heading="No calculators available"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>No calculators have been created yet. Please create a calculator first.</p>
          <Button primary url="/calculatorBuilder">
            Create Calculator
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: window.innerWidth < 768 ? '16px' : '24px' 
    }}>
      {/* Calculator Selection */}
      {calculators.length > 1 && (
        <LegacyCard sectioned>
          <VerticalStack gap="4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <Text variant="headingLg" fontWeight="semibold">
                Select Calculator
              </Text>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  onClick={() => {
                    try {
                      const displayCalculators = getCalculatorsForDisplay();
                      console.log('CustomerCalculator: Manual refresh, loaded calculators:', displayCalculators);
                      setCalculators(displayCalculators);
                    } catch (error) {
                      console.error('CustomerCalculator: Manual refresh failed:', error);
                    }
                  }}
                >
                  Refresh
                </Button>
                <Button url="/calculatorBuilder" icon={PlusMinor}>
                  Create New Calculator
                </Button>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {calculators.map((calculator) => (
                <div
                  key={calculator.id}
                  style={{
                    padding: '16px',
                    border: selectedCalculator?.id === calculator.id ? '2px solid #007cba' : '1px solid #e1e3e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedCalculator?.id === calculator.id ? '#f0f8ff' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleCalculatorSelect(calculator)}
                >
                  <Text variant="bodyMd" fontWeight="semibold">
                    {calculator.name}
                  </Text>
                  <Text variant="bodySm" color="subdued">
                    {calculator.description}
                  </Text>
                  <Badge status={calculator.status === 'active' ? 'success' : 'warning'}>
                    {calculator.status}
                  </Badge>
                </div>
              ))}
            </div>
          </VerticalStack>
        </LegacyCard>
      )}

      {/* Single Calculator Header with Create Button */}
      {calculators.length === 1 && (
        <LegacyCard sectioned>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Text variant="headingLg" fontWeight="semibold">
              Available Calculators
            </Text>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => {
                  try {
                    const displayCalculators = getCalculatorsForDisplay();
                    console.log('CustomerCalculator: Manual refresh, loaded calculators:', displayCalculators);
                    setCalculators(displayCalculators);
                  } catch (error) {
                    console.error('CustomerCalculator: Manual refresh failed:', error);
                  }
                }}
              >
                Refresh
              </Button>
              <Button url="/calculatorBuilder" icon={PlusMinor}>
                Create New Calculator
              </Button>
            </div>
          </div>
        </LegacyCard>
      )}

      {/* Calculator Header */}
      {selectedCalculator && (
        <LegacyCard sectioned>
          <VerticalStack gap="4" align="center">
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#007cba', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AnalyticsMinor style={{ color: 'white', fontSize: '32px' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text variant="headingXl" fontWeight="semibold">
                {selectedCalculator.name}
              </Text>
              <Text variant="bodyLg" color="subdued">
                {selectedCalculator.description}
              </Text>
            </div>
          </VerticalStack>
        </LegacyCard>
      )}

      {/* Calculator Form */}
      {selectedCalculator && (
        <LegacyCard sectioned>
          <form onSubmit={handleSubmit}>
            <VerticalStack gap="6">
              <div>
                <Text variant="headingLg" fontWeight="semibold">
                  Product Specifications
                </Text>
                <Text variant="bodyMd" color="subdued">
                  Enter your requirements to get an instant price quote
                </Text>
              </div>

              {/* Form Elements */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '24px' 
              }}>
                {(selectedCalculator.elements || selectedCalculator.fields || []).map(renderFormElement)}
              </div>

              {/* Calculate Button */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button
                  size="large"
                  primary
                  onClick={calculatePrice}
                  loading={isCalculating}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Price'}
                </Button>
              </div>
            </VerticalStack>
          </form>
        </LegacyCard>
      )}

      {/* Price Display */}
      {calculatedPrice && (
        <LegacyCard sectioned>
          <VerticalStack gap="4" align="center">
            <div style={{ textAlign: 'center' }}>
              <Text variant="headingMd" color="subdued">
                Estimated Price
              </Text>
              <Text variant="displayMd" fontWeight="bold" color="success">
                {formatPrice(calculatedPrice)}
              </Text>
              <Text variant="bodySm" color="subdued">
                *Prices are estimates and may vary based on final specifications
              </Text>
            </div>
            
            <Divider />
            
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              flexWrap: 'wrap', 
              justifyContent: 'center' 
            }}>
              <Button size="large" primary>
                Add to Cart
              </Button>
              <Button size="large">
                Request Quote
              </Button>
              <Button size="large">
                Save Configuration
              </Button>
            </div>
          </VerticalStack>
        </LegacyCard>
      )}

      {/* Information Section */}
      {selectedCalculator && (
        <LegacyCard sectioned>
          <VerticalStack gap="4">
            <Text variant="headingMd" fontWeight="semibold">
              How It Works
            </Text>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#f6f6f7', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Text variant="headingMd" fontWeight="bold">1</Text>
                </div>
                <Text variant="bodyMd" fontWeight="semibold">Enter Specifications</Text>
                <Text variant="bodySm" color="subdued">
                  Fill in all required fields with your product details
                </Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#f6f6f7', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Text variant="headingMd" fontWeight="bold">2</Text>
                </div>
                <Text variant="bodyMd" fontWeight="semibold">Calculate Price</Text>
                <Text variant="bodySm" color="subdued">
                  Click calculate to get your instant price quote
                </Text>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#f6f6f7', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Text variant="headingMd" fontWeight="bold">3</Text>
                </div>
                <Text variant="bodyMd" fontWeight="semibold">Take Action</Text>
                <Text variant="bodySm" color="subdued">
                  Add to cart, request quote, or save your configuration
                </Text>
              </div>
            </div>
          </VerticalStack>
        </LegacyCard>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          content={toastMessage}
          error={toastType === 'error'}
          onDismiss={() => setShowToast(false)}
          action={{
            content: 'Dismiss',
            onAction: () => setShowToast(false)
          }}
        />
      )}
    </div>
  );
}
