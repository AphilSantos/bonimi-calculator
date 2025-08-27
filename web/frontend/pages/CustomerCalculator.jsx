import React, { useState, useEffect } from 'react';
import { 
  LegacyCard, 
  Text, 
  Button, 
  TextField, 
  Select,
  Badge,
  Divider,
  Spinner
} from '@shopify/polaris';
import { 
  AnalyticsMinor,
  AlertMinor,
  PlusMinor
} from '@shopify/polaris-icons';

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

  // Load calculators from SQLite database via API
  const loadCalculators = async () => {
    try {
      const response = await fetch('/api/calculators');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CustomerCalculator: Loaded calculators from API:', data);
      
      if (data && Array.isArray(data)) {
        console.log('CustomerCalculator: Setting calculators:', data);
        setCalculators(data);
        
        // If no calculators exist, create a demo calculator
        if (data.length === 0) {
          createDemoCalculator();
        } else if (data.length === 1) {
          // If there's only one calculator, automatically select it
          console.log('CustomerCalculator: Auto-selecting single calculator:', data[0]);
          console.log('CustomerCalculator: Auto-selected calculator elements:', data[0].elements);
          console.log('CustomerCalculator: Auto-selected calculator config:', data[0].config);
          setSelectedCalculator(data[0]);
          initializeFormData(data[0]);
        }
      } else {
        console.error('CustomerCalculator: Invalid data format from API:', data);
        createDemoCalculator();
      }
    } catch (error) {
      console.error('Error loading calculators from API:', error);
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
    console.log('CustomerCalculator: Initializing form data for calculator:', calculator);
    const initialData = {};
    
    // Support both elements (CalculatorBuilder format) and fields (other pages format)
    const elementsToProcess = calculator.elements || calculator.fields || [];
    console.log('CustomerCalculator: Elements to process:', elementsToProcess);
    
    elementsToProcess.forEach(element => {
      const elementId = element.id || element.name;
      console.log('CustomerCalculator: Processing element:', { elementId, type: element.type, config: element.config });
      
      // Handle different element types with proper defaults
      switch (element.type) {
        case 'select':
          // Get options from config or fallback to options property
          const options = element.config?.options || element.options || [];
          if (options.length > 0) {
            const firstOption = options[0];
            initialData[elementId] = typeof firstOption === 'string' ? firstOption : firstOption.value || '';
          } else {
            initialData[elementId] = '';
          }
          break;
          
        case 'number-input':
        case 'number':
          initialData[elementId] = '';
          break;
          
        case 'text-input':
          initialData[elementId] = '';
          break;
          
        case 'checkbox':
          initialData[elementId] = element.config?.checked || false;
          break;
          
        case 'radio':
          const radioOptions = element.config?.options || element.options || [];
          if (radioOptions.length > 0) {
            const firstOption = radioOptions[0];
            initialData[elementId] = typeof firstOption === 'string' ? firstOption : firstOption.value || '';
          } else {
            initialData[elementId] = '';
          }
          break;
          
        case 'calculation-display':
          // This is a display-only element, no input needed
          initialData[elementId] = '';
          break;
          
        case 'file-upload':
        case 'photo-editor':
          // These are file upload elements, no initial value needed
          initialData[elementId] = '';
          break;
          
        default:
          initialData[elementId] = '';
          break;
      }
    });
    
    console.log('CustomerCalculator: Initial form data:', initialData);
    setFormData(initialData);
  };

  // Handle calculator selection
  const handleCalculatorSelect = (calculator) => {
    console.log('CustomerCalculator: Selected calculator:', calculator);
    console.log('CustomerCalculator: Calculator elements:', calculator.elements);
    console.log('CustomerCalculator: Calculator fields:', calculator.fields);
    console.log('CustomerCalculator: Full calculator structure:', JSON.stringify(calculator, null, 2));
    setSelectedCalculator(calculator);
    initializeFormData(calculator);
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

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Validate form
  const validateForm = () => {
    if (!selectedCalculator) return false;
    
    const newErrors = {};
    
    // Support both elements (CalculatorBuilder format) and fields (other pages format)
    const elementsToValidate = selectedCalculator.elements || selectedCalculator.fields || [];
    elementsToValidate.forEach(element => {
      const elementId = element.id || element.name;
      const elementLabel = element.config?.label || element.label || 'Field';
      const elementType = element.type;
      const elementRequired = element.config?.required || element.required || false;
      const elementMin = element.config?.min || element.min;
      const elementMax = element.config?.max || element.max;
      
      if (elementRequired) {
        const value = formData[elementId];
        if (!value || value === '') {
          newErrors[elementId] = `${elementLabel} is required`;
        } else if (elementType === 'number-input' || elementType === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            newErrors[elementId] = `${elementLabel} must be a valid number`;
          } else if (elementMin && numValue < elementMin) {
            newErrors[elementId] = `${elementLabel} must be at least ${elementMin}`;
          } else if (elementMax && numValue > elementMax) {
            newErrors[elementId] = `${elementLabel} must be no more than ${elementMax}`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate price using the calculator's formula
  const calculatePrice = () => {
    if (!selectedCalculator || !validateForm()) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        let price = 0;
        
        if (selectedCalculator.formula) {
          console.log('CustomerCalculator: Calculating with formula:', selectedCalculator.formula);
          console.log('CustomerCalculator: Form data:', formData);
          
          // Map timestamp-based IDs to meaningful variable names for formula evaluation
          const variableMapping = {};
          const elementsToProcess = selectedCalculator.elements || selectedCalculator.fields || [];
          
          elementsToProcess.forEach((element, index) => {
            const elementId = element.id || element.name;
            const elementLabel = element.config?.label || element.label || '';
            
            // Find the corresponding form data value by matching element ID
            const formDataKey = Object.keys(formData).find(key => key === elementId);
            if (formDataKey) {
              const value = parseFloat(formData[formDataKey]) || 0;
              
              // Create meaningful variable names based on element type and label
              let variableName = '';
              if (element.type === 'number-input') {
                // Extract meaningful name from label (e.g., "Room Length (m)" -> "length")
                if (elementLabel.toLowerCase().includes('length')) {
                  variableName = 'length';
                } else if (elementLabel.toLowerCase().includes('width')) {
                  variableName = 'width';
                } else if (elementLabel.toLowerCase().includes('height')) {
                  variableName = 'height';
                } else if (elementLabel.toLowerCase().includes('quantity')) {
                  variableName = 'quantity';
                } else {
                  variableName = `field${index}`;
                }
              } else if (element.type === 'select') {
                // For select fields, use the label to determine the variable name
                if (elementLabel.toLowerCase().includes('paint') || elementLabel.toLowerCase().includes('quality')) {
                  variableName = 'paintQuality';
                } else if (elementLabel.toLowerCase().includes('material')) {
                  variableName = 'material';
                } else {
                  variableName = `select${index}`;
                }
              } else {
                variableName = `field${index}`;
              }
              
              variableMapping[variableName] = value;
            }
          });
          
          // Create evaluation context with meaningful variable names
          const evaluationContext = {
            ...variableMapping,
            basePrice: selectedCalculator.basePrice || 50,
            // Add multipliers
            ...(selectedCalculator.materialMultipliers || {}),
            ...(selectedCalculator.edgeMultipliers || {}),
            ...(selectedCalculator.paintMultipliers || {})
          };
          
          console.log('CustomerCalculator: Variable mapping:', variableMapping);
          console.log('CustomerCalculator: Evaluation context:', evaluationContext);
          
          // Replace formula variables with actual values
          let formula = selectedCalculator.formula;
          
          // Replace variable names in the formula with actual values
          Object.keys(variableMapping).forEach(variableName => {
            const value = variableMapping[variableName];
            // Use regex to replace the variable name, ensuring it's a whole word
            const regex = new RegExp(`\\b${variableName}\\b`, 'g');
            formula = formula.replace(regex, value);
          });
          
          // Handle paint multiplier replacement
          if (variableMapping.paintQuality && selectedCalculator.paintMultipliers) {
            const paintQuality = variableMapping.paintQuality;
            // Find the paint quality value in the form data to get the actual selected option
            const paintQualityElement = elementsToProcess.find(el => 
              el.type === 'select' && 
              (el.config?.label?.toLowerCase().includes('paint') || el.config?.label?.toLowerCase().includes('quality'))
            );
            
            if (paintQualityElement) {
              const paintQualityKey = Object.keys(formData).find(key => key === paintQualityElement.id);
              if (paintQualityKey) {
                const selectedPaintQuality = formData[paintQualityKey];
                const paintMultiplier = selectedCalculator.paintMultipliers[selectedPaintQuality];
                if (paintMultiplier !== undefined) {
                  formula = formula.replace(/\bpaintMultiplier\b/g, paintMultiplier);
                  console.log('CustomerCalculator: Replaced paintMultiplier with:', paintMultiplier);
                }
              }
            }
          }

          // Handle select element pricing configurations
          elementsToProcess.forEach(element => {
            if (element.type === 'select' && element.config?.pricingType && element.config?.pricingType !== 'none') {
              const elementKey = Object.keys(formData).find(key => key === element.id);
              if (elementKey) {
                const selectedOption = formData[elementKey];
                const pricing = element.config.pricing?.[selectedOption];
                
                if (pricing !== undefined) {
                  const elementVariableName = element.config?.label?.toLowerCase().replace(/\s+/g, '') || `select${element.id}`;
                  
                  switch (element.config.pricingType) {
                    case 'multiplier':
                      // Replace variable with multiplier value
                      const multiplierRegex = new RegExp(`\\b${elementVariableName}Multiplier\\b`, 'g');
                      formula = formula.replace(multiplierRegex, pricing);
                      console.log(`CustomerCalculator: Replaced ${elementVariableName}Multiplier with:`, pricing, 'for option:', selectedOption);
                      break;
                      
                    case 'fixed':
                      // Replace basePrice with fixed price for this option
                      if (selectedOption === formData[elementKey]) {
                        formula = formula.replace(/\bbasePrice\b/g, pricing);
                        console.log(`CustomerCalculator: Replaced basePrice with fixed price:`, pricing, 'for option:', selectedOption);
                      }
                      break;
                      
                    case 'additional':
                      // Add additional cost to basePrice
                      const additionalCost = pricing;
                      formula = formula.replace(/\bbasePrice\b/g, `(${evaluationContext.basePrice} + ${additionalCost})`);
                      console.log(`CustomerCalculator: Added additional cost:`, additionalCost, 'for option:', selectedOption);
                      break;
                  }
                }
              }
            }
          });

          // Handle legacy material multiplier replacement (for backward compatibility)
          if (variableMapping.material !== undefined) {
            // Find the material selection element to get the actual selected option
            const materialElement = elementsToProcess.find(el => 
              el.type === 'select' && 
              el.config?.label?.toLowerCase().includes('material')
            );
            
            if (materialElement && !materialElement.config?.pricingType) {
              const materialKey = Object.keys(formData).find(key => key === materialElement.id);
              if (materialKey) {
                const selectedMaterial = formData[materialKey];
                // Define material multipliers based on selection
                const materialMultipliers = {
                  'Pine': 1.0,
                  'Oak': 1.5,
                  'Mahogany': 2.0,
                  'MDF': 0.8
                };
                const materialMultiplier = materialMultipliers[selectedMaterial] || 1.0;
                formula = formula.replace(/\bmaterialMultiplier\b/g, materialMultiplier);
                console.log('CustomerCalculator: Replaced materialMultiplier with:', materialMultiplier, 'for material:', selectedMaterial);
              }
            }
          }
          
          // Replace remaining variables with defaults
          formula = formula.replace(/\bbasePrice\b/g, evaluationContext.basePrice);
          
          console.log('CustomerCalculator: Final formula:', formula);
          
          // Evaluate the simplified formula
          try {
            price = eval(formula);
            console.log('CustomerCalculator: Calculated price:', price);
          } catch (evalError) {
            console.error('Formula evaluation error:', evalError);
            throw new Error(`Formula evaluation failed: ${evalError.message}`);
          }
          
        } else {
          // Fallback calculation if no formula
          const { length, width, material, 'edge-finishing': edgeFinishing, quantity } = formData;
          const materialMultiplier = selectedCalculator.materialMultipliers?.[material] || 1;
          const edgeMultiplier = selectedCalculator.edgeMultipliers?.[edgeFinishing] || 1;
          const area = (length * width) / 10000;
          
          price = (
            (selectedCalculator.basePrice || 50) + 
            (area * 1500) + 
            (area * 1500 * materialMultiplier) + 
            (area * 1500 * edgeMultiplier)
          ) * (quantity || 1);
        }
        
        setCalculatedPrice(price);
        setToastMessage('Price calculated successfully!');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        console.error('Calculation error:', error);
        setToastMessage(`Error calculating price: ${error.message}`);
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
    console.log('CustomerCalculator: Rendering element:', element);
    
    // Support both elements (CalculatorBuilder format) and fields (other pages format)
    const elementId = element.id || element.name;
    const elementLabel = element.config?.label || element.label || 'Field';
    const elementType = element.type;
    const elementRequired = element.config?.required || element.required || false;
    const elementPlaceholder = element.config?.placeholder || element.placeholder || '';
    const elementMin = element.config?.min || element.min;
    const elementMax = element.config?.max || element.max;
    const elementStep = element.config?.step || element.step;
    const elementOptions = element.config?.options || element.options || [];
    
    console.log('CustomerCalculator: Element processed:', { 
      elementId, 
      elementLabel, 
      elementType, 
      elementRequired,
      elementOptions: elementOptions.length,
      hasValue: formData[elementId] !== undefined
    });
    
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
            helpText={elementRequired ? 'This field is required' : ''}
          />
        );

      case 'select':
        // Convert options to the format expected by Polaris Select
        const selectOptions = elementOptions.map((option, index) => {
          if (typeof option === 'string') {
            return { label: option, value: option };
          } else if (option.label && option.value) {
            return option;
          } else {
            return { label: `Option ${index + 1}`, value: option };
          }
        });
        
        return (
          <Select
            key={elementId}
            label={elementLabel}
            options={selectOptions}
            value={value}
            onChange={(value) => handleInputChange(elementId, value)}
            error={error}
            required={elementRequired}
            helpText={elementRequired ? 'This field is required' : ''}
          />
        );

      case 'text-input':
        return (
          <TextField
            key={elementId}
            label={elementLabel}
            type={element.config?.type || 'text'}
            value={value}
            onChange={(value) => handleInputChange(elementId, value)}
            placeholder={elementPlaceholder}
            error={error}
            required={elementRequired}
            helpText={elementRequired ? 'This field is required' : ''}
          />
        );

      case 'checkbox':
        return (
          <div key={elementId} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '16px',
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <input
              type="checkbox"
              id={elementId}
              checked={value || false}
              onChange={(e) => handleInputChange(elementId, e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor={elementId} style={{ fontWeight: '500', cursor: 'pointer' }}>
              {elementLabel}
            </label>
            {elementRequired && <span style={{ color: '#d82c0d' }}>*</span>}
          </div>
        );

      case 'radio':
        return (
          <div key={elementId} style={{ 
            padding: '16px',
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ marginBottom: '12px', fontWeight: '500' }}>
              {elementLabel}
              {elementRequired && <span style={{ color: '#d82c0d', marginLeft: '4px' }}>*</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {elementOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={elementId}
                      value={optionValue}
                      checked={value === optionValue}
                      onChange={(e) => handleInputChange(elementId, e.target.value)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    {optionLabel}
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'text-block':
        return (
          <div key={elementId} style={{ 
            padding: '16px',
            backgroundColor: '#f6f6f7',
            borderRadius: '8px',
            border: '1px solid #e1e3e5'
          }}>
            <Text variant="bodyMd" style={{ 
              fontSize: element.config?.fontSize || '16px',
              color: element.config?.color || '#000000',
              lineHeight: '1.4',
              margin: 0
            }}>
              {element.config?.text || elementLabel}
            </Text>
          </div>
        );

      case 'calculation-display':
        return (
          <div key={elementId} style={{ 
            padding: '16px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
            border: '2px solid #007cba',
            textAlign: 'center'
          }}>
            <Text variant="bodyMd" fontWeight="semibold" style={{ marginBottom: '8px' }}>
              {elementLabel}
            </Text>
            <div style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#007cba',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e1e3e5'
            }}>
              {calculatedPrice ? formatPrice(calculatedPrice) : 'Enter values and calculate'}
            </div>
            {element.config?.formula && (
              <Text variant="bodySm" color="subdued" style={{ marginTop: '8px' }}>
                Formula: {element.config.formula}
              </Text>
            )}
          </div>
        );

      case 'file-upload':
        return (
          <div key={elementId} style={{ 
            padding: '16px',
            border: '2px dashed #e1e3e5',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            textAlign: 'center'
          }}>
            <Text variant="bodyMd" fontWeight="semibold" style={{ marginBottom: '8px' }}>
              {elementLabel}
            </Text>
            <div style={{ 
              padding: '20px',
              border: '1px solid #e1e3e5',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}>
              <Text variant="bodySm" color="subdued">
                📁 Click to upload file
              </Text>
            </div>
            {elementRequired && <span style={{ color: '#d82c0d', marginTop: '8px', display: 'block' }}>*</span>}
          </div>
        );

      case 'photo-editor':
        return (
          <div key={elementId} style={{ 
            padding: '16px',
            border: '2px dashed #e1e3e5',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            textAlign: 'center'
          }}>
            <Text variant="bodyMd" fontWeight="semibold" style={{ marginBottom: '8px' }}>
              {elementLabel}
            </Text>
            <div style={{ 
              padding: '20px',
              border: '1px solid #e1e3e5',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}>
              <Text variant="bodySm" color="subdued">
                📷 Click to upload photo
              </Text>
            </div>
            {elementRequired && <span style={{ color: '#d82c0d', marginTop: '8px', display: 'block' }}>*</span>}
          </div>
        );

      default:
        console.warn('CustomerCalculator: Unknown element type:', elementType, element);
        return (
          <div key={elementId} style={{ 
            padding: '16px',
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <Text variant="bodyMd" color="subdued">
              Unknown element type: {elementType}
            </Text>
          </div>
        );
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
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f6f6f7',
          borderRadius: '12px',
          border: '1px solid #e1e3e5'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#e1e3e5',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text variant="headingLg" style={{ color: '#6d7175' }}>📊</Text>
          </div>
          <Text variant="headingLg" fontWeight="semibold" style={{ marginBottom: '16px' }}>
            No calculators available
          </Text>
          <Text variant="bodyMd" color="subdued" style={{ marginBottom: '24px' }}>
            No calculators have been created yet. Please create a calculator first.
          </Text>
          <Button primary url="/calculatorBuilder">
            Create Calculator
          </Button>
        </div>
      </div>
    );
  }

  console.log('CustomerCalculator: Rendering with calculators:', calculators.length, 'selectedCalculator:', selectedCalculator);
  
  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: window.innerWidth < 768 ? '16px' : '24px' 
    }}>
      {/* Calculator Selection */}
      {calculators.length > 1 && (
        <LegacyCard sectioned>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <Text variant="headingLg" fontWeight="semibold">
                Select Calculator
              </Text>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  onClick={loadCalculators}
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
          </div>
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
                onClick={loadCalculators}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
          </div>
        </LegacyCard>
      )}

      {/* Calculator Form */}
      {selectedCalculator && (
        <LegacyCard sectioned>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                {(() => {
                  const elements = selectedCalculator.elements || selectedCalculator.fields || [];
                  console.log('CustomerCalculator: Rendering form elements:', elements);
                  return elements.map(renderFormElement);
                })()}
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
            </div>
          </form>
        </LegacyCard>
      )}

      {/* Price Display */}
      {calculatedPrice && (
        <LegacyCard sectioned>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
          </div>
        </LegacyCard>
      )}

      {/* Information Section */}
      {selectedCalculator && (
        <LegacyCard sectioned>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          </div>
        </LegacyCard>
      )}

      {/* Custom Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: toastType === 'error' ? '#d82c0d' : '#50b83c',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <div style={{ flex: 1 }}>
            <Text variant="bodyMd" style={{ color: 'white', fontWeight: '500' }}>
              {toastMessage}
            </Text>
          </div>
          <Button
            size="small"
            onClick={() => setShowToast(false)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              minWidth: 'auto',
              padding: '4px 8px'
            }}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}

