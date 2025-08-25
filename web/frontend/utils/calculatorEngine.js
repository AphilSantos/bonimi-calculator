/**
 * Calculator Engine for parsing and evaluating pricing formulas
 * Supports mathematical expressions with variables and field values
 */

// Safe mathematical expression evaluator
function evaluateFormula(formula, variables) {
  try {
    // Replace variables with their values
    let processedFormula = formula;
    
    // Replace variable names with their values
    Object.keys(variables).forEach(varName => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      processedFormula = processedFormula.replace(regex, variables[varName]);
    });
    
    // Basic validation - only allow safe mathematical operations
    const safeFormula = processedFormula.replace(/[^0-9+\-*/().\s]/g, '');
    
    // Debug: Log the processed formula
    console.log('Original formula:', formula);
    console.log('Processed formula:', processedFormula);
    console.log('Safe formula:', safeFormula);
    console.log('Variables used:', variables);
    
    // Use Function constructor for safe evaluation (limited scope)
    const result = new Function('return ' + safeFormula)();
    
    // Return result rounded to 2 decimal places
    return Math.round(result * 100) / 100;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    console.error('Processed formula:', processedFormula);
    console.error('Variables:', variables);
    return 0;
  }
}

// Parse field input values and convert to numbers
function parseFieldValues(fields, inputValues) {
  const variables = {};
  
  fields.forEach(field => {
    const fieldName = typeof field === 'string' ? field : field.name;
    const value = inputValues[fieldName];
    
    if (value !== undefined && value !== '') {
      // Convert to number and handle different input types
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (!isNaN(numValue)) {
        variables[fieldName] = numValue;
      }
    }
  });
  
  return variables;
}

// Main calculator function
export function calculatePrice(calculator, inputValues, basePrice = 0) {
  try {
    // Parse the formula and fields
    const { formula, fields } = calculator;
    
    if (!formula || !fields || fields.length === 0) {
      return basePrice;
    }
    
    // Parse input values
    const variables = parseFieldValues(fields, inputValues);
    
    // Add base price to variables
    variables.basePrice = basePrice;
    
    // Check if we have enough variables to calculate
    // We need at least basePrice + all required fields
    const requiredFields = fields.filter(field => 
      typeof field === 'string' ? true : field.required !== false
    );
    
    const hasRequiredValues = requiredFields.every(field => {
      const fieldName = typeof field === 'string' ? field : field.name;
      return variables[fieldName] !== undefined;
    });
    
    if (!hasRequiredValues || Object.keys(variables).length < 2) {
      console.log('Not enough values to calculate price:', {
        variables,
        requiredFields: requiredFields.length,
        hasRequiredValues
      });
      return basePrice;
    }
    
    // Debug: Log the calculation process
    console.log('Calculating price with:', {
      formula,
      variables,
      basePrice
    });
    
    // Evaluate the formula
    const calculatedPrice = evaluateFormula(formula, variables);
    
    console.log('Calculated price:', calculatedPrice);
    return calculatedPrice;
  } catch (error) {
    console.error('Price calculation error:', error);
    return basePrice;
  }
}

// Validate calculator configuration
export function validateCalculator(calculator) {
  const errors = [];
  
  if (!calculator.name || calculator.name.trim() === '') {
    errors.push('Calculator name is required');
  }
  
  if (!calculator.formula || calculator.formula.trim() === '') {
    errors.push('Formula is required');
  }
  
  if (!calculator.fields || calculator.fields.length === 0) {
    errors.push('At least one field is required');
  }
  
  // Validate formula syntax
  if (calculator.formula) {
    try {
      // Test with sample values
      const testVariables = {};
      calculator.fields.forEach(field => {
        const fieldName = typeof field === 'string' ? field : field.name;
        testVariables[fieldName] = 1; // Test with value 1
      });
      testVariables.basePrice = 10;
      
      const testResult = calculatePrice(calculator, testVariables, 10);
      if (isNaN(testResult)) {
        errors.push('Formula contains invalid syntax');
      }
    } catch (error) {
      errors.push('Formula contains invalid syntax');
    }
  }
  
  return errors;
}

// Format price for display
export function formatPrice(price, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(price);
}

// Get field display information
export function getFieldDisplayInfo(field) {
  if (typeof field === 'string') {
    return {
      name: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      type: 'number',
      required: true,
      placeholder: `Enter ${field}`
    };
  }
  
  return {
    name: field.name,
    label: field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1),
    type: field.type || 'number',
    required: field.required !== false,
    placeholder: field.placeholder || `Enter ${field.label || field.name}`,
    helpText: field.helpText,
    options: field.options || []
  };
}
