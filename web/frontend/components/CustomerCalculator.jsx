import React, { useState, useEffect } from 'react';
import {
  LegacyCard,
  FormLayout,
  TextField,
  Select,
  Button,
  Text,
  VerticalStack,
  Badge,
  Divider,
  Spinner
} from '@shopify/polaris';
import { calculatePrice, formatPrice, getFieldDisplayInfo } from '../utils/calculatorEngine';

export function CustomerCalculator({ calculator, basePrice = 0, onAddToCart, productTitle = "Custom Product" }) {
  const [inputValues, setInputValues] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(basePrice);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize input values when calculator changes
  useEffect(() => {
    if (calculator && calculator.fields) {
      const initialValues = {};
      calculator.fields.forEach(field => {
        const fieldInfo = getFieldDisplayInfo(field);
        initialValues[fieldInfo.name] = '';
      });
      setInputValues(initialValues);
      setCalculatedPrice(basePrice);
      
      // Debug: Log the calculator and fields
      console.log('Calculator loaded:', calculator);
      console.log('Fields:', calculator.fields);
    }
  }, [calculator, basePrice]);

  // Calculate price when input values change
  useEffect(() => {
    if (calculator && Object.keys(inputValues).length > 0) {
      setIsCalculating(true);
      
      // Debounce the calculation to avoid too many recalculations
      const timeoutId = setTimeout(() => {
        try {
          const price = calculatePrice(calculator, inputValues, basePrice);
          setCalculatedPrice(price);
          setErrors({});
        } catch (error) {
          console.error('Calculation error:', error);
          setErrors({ calculation: 'Error calculating price' });
        } finally {
          setIsCalculating(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [inputValues, calculator, basePrice]);

  const handleInputChange = (fieldName, value) => {
    console.log(`Input changed: ${fieldName} = ${value}`);
    setInputValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (calculator && calculator.fields) {
      calculator.fields.forEach(field => {
        const fieldInfo = getFieldDisplayInfo(field);
        const value = inputValues[fieldInfo.name];
        
        if (fieldInfo.required && (!value || value === '')) {
          newErrors[fieldInfo.name] = `${fieldInfo.label} is required`;
        } else if (value && fieldInfo.type === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue <= 0) {
            newErrors[fieldInfo.name] = `${fieldInfo.label} must be a positive number`;
          }
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (validateInputs()) {
      const configuration = {
        calculator: calculator.name,
        fields: inputValues,
        calculatedPrice: calculatedPrice,
        basePrice: basePrice
      };
      
      if (onAddToCart) {
        onAddToCart(configuration);
      }
    }
  };

  if (!calculator) {
    return (
      <LegacyCard sectioned>
        <Text>No calculator configured for this product.</Text>
      </LegacyCard>
    );
  }

  const hasValidInputs = Object.values(inputValues).some(value => value && value !== '');
  const canAddToCart = hasValidInputs && calculatedPrice > 0 && Object.keys(errors).length === 0;

  return (
    <LegacyCard sectioned>
      <VerticalStack gap="4">
        <div>
          <Text variant="headingMd" as="h3">
            Customize Your {productTitle}
          </Text>
          <Text variant="bodyMd" as="p" color="subdued">
            Configure your product specifications and see real-time pricing
          </Text>
        </div>

        <Divider />

        <FormLayout>
          {calculator.fields.map((field, index) => {
            const fieldInfo = getFieldDisplayInfo(field);
            const value = inputValues[fieldInfo.name] || '';
            const error = errors[fieldInfo.name];

            // Debug: Log field info
            console.log(`Rendering field ${index}:`, fieldInfo);

            if (fieldInfo.type === 'select') {
              // Debug: Log select options
              console.log(`Select options for ${fieldInfo.name}:`, fieldInfo.options);
              
              // Format options for Polaris Select component
              const selectOptions = (fieldInfo.options || []).map(option => ({
                label: option.label || option.value?.toString() || option.toString(),
                value: option.value?.toString() || option.toString()
              }));
              
              return (
                <Select
                  key={`${fieldInfo.name}-${index}`}
                  label={fieldInfo.label}
                  options={selectOptions}
                  value={value}
                  onChange={(value) => handleInputChange(fieldInfo.name, value)}
                  error={error}
                  helpText={fieldInfo.helpText}
                  required={fieldInfo.required}
                />
              );
            }

            return (
              <TextField
                key={`${fieldInfo.name}-${index}`}
                label={fieldInfo.label}
                type={fieldInfo.type}
                value={value}
                onChange={(value) => handleInputChange(fieldInfo.name, value)}
                placeholder={fieldInfo.placeholder}
                helpText={fieldInfo.helpText}
                error={error}
                required={fieldInfo.required}
                autoComplete="off"
              />
            );
          })}
        </FormLayout>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text variant="bodyMd" as="p" color="subdued">
              Base Price
            </Text>
            <Text variant="headingMd" as="p">
              {formatPrice(basePrice)}
            </Text>
          </div>

          <div style={{ textAlign: 'center' }}>
            {isCalculating ? (
              <Spinner size="small" />
            ) : (
              <Badge status="info">Calculating...</Badge>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <Text variant="bodyMd" as="p" color="subdued">
              Total Price
            </Text>
            <Text variant="headingLg" as="p" fontWeight="bold">
              {formatPrice(calculatedPrice)}
            </Text>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div>
            {Object.values(errors).map((error, index) => (
              <Text key={index} variant="bodyMd" color="critical">
                {error}
              </Text>
            ))}
          </div>
        )}

        <Button
          primary
          fullWidth
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          loading={isCalculating}
        >
          Add to Cart - {formatPrice(calculatedPrice)}
        </Button>

        {calculator.description && (
          <div>
            <Text variant="bodyMd" as="p" color="subdued">
              {calculator.description}
            </Text>
          </div>
        )}
      </VerticalStack>
    </LegacyCard>
  );
}
