// Utility functions to transform calculator data between different formats
// CalculatorBuilder uses 'elements', other pages use 'fields'

/**
 * Convert CalculatorBuilder format (elements) to other pages format (fields)
 * @param {Object} calculator - Calculator in CalculatorBuilder format
 * @returns {Object} Calculator in other pages format
 */
export function transformCalculatorForDisplay(calculator) {
  if (!calculator) return null;
  
  console.log('transformCalculatorForDisplay: Input calculator:', calculator);
  
  // If it already has fields, return as is
  if (calculator.fields) {
    console.log('transformCalculatorForDisplay: Calculator already has fields, returning as is');
    return calculator;
  }
  
  // Convert elements to fields
  if (calculator.elements) {
    console.log('transformCalculatorForDisplay: Converting elements to fields');
    const fields = calculator.elements.map(element => {
      const field = {
        name: element.id,
        label: element.config?.label || element.name || 'Field',
        type: element.type === 'number-input' ? 'number' : 
              element.type === 'text-input' ? 'text' : 
              element.type === 'select' ? 'select' : 
              element.type === 'checkbox' ? 'checkbox' : 
              element.type === 'radio' ? 'radio' : 'text',
        required: element.config?.required || false,
        placeholder: element.config?.placeholder || '',
        helpText: element.config?.helpText || ''
      };
      
      // Add type-specific properties
      if (element.type === 'number-input') {
        field.min = element.config?.min;
        field.max = element.config?.max;
        field.step = element.config?.step;
      }
      
      if (element.type === 'select') {
        field.options = element.config?.options || [];
      }
      
      if (element.type === 'checkbox') {
        field.checked = element.config?.checked || false;
      }
      
      return field;
    });
    
    const result = {
      ...calculator,
      fields: fields
    };
    console.log('transformCalculatorForDisplay: Result after conversion:', result);
    return result;
  }
  
  console.log('transformCalculatorForDisplay: No elements or fields found, returning original');
  return calculator;
}

/**
 * Convert other pages format (fields) to CalculatorBuilder format (elements)
 * @param {Object} calculator - Calculator in other pages format
 * @returns {Object} Calculator in CalculatorBuilder format
 */
export function transformCalculatorForBuilder(calculator) {
  if (!calculator) return null;
  
  // If it already has elements, return as is
  if (calculator.elements) return calculator;
  
  // Convert fields to elements
  if (calculator.fields) {
    const elements = calculator.fields.map(field => {
      const element = {
        id: field.name,
        type: field.type === 'number' ? 'number-input' : 
              field.type === 'text' ? 'text-input' : 
              field.type === 'select' ? 'select' : 
              field.type === 'checkbox' ? 'checkbox' : 
              field.type === 'radio' ? 'radio' : 'text-input',
        name: field.label,
        config: {
          label: field.label,
          placeholder: field.placeholder || '',
          required: field.required || false,
          helpText: field.helpText || ''
        }
      };
      
      // Add type-specific config
      if (field.type === 'number') {
        element.config.min = field.min;
        element.config.max = field.max;
        element.config.step = field.step;
      }
      
      if (field.type === 'select') {
        element.config.options = field.options || [];
      }
      
      if (field.type === 'checkbox') {
        element.config.checked = field.checked || false;
      }
      
      // Add default position for canvas
      element.position = { x: 0, y: 0 };
      
      return element;
    });
    
    return {
      ...calculator,
      elements: elements
    };
  }
  
  return calculator;
}

/**
 * Get all calculators from localStorage and transform them for display
 * @returns {Array} Array of calculators in display format
 */
export function getCalculatorsForDisplay() {
  try {
    const savedCalculators = JSON.parse(localStorage.getItem('bonimi_calculators') || '[]');
    return savedCalculators.map(transformCalculatorForDisplay);
  } catch (error) {
    console.error('Error loading calculators from localStorage:', error);
    return [];
  }
}

/**
 * Get all calculators from localStorage and transform them for builder
 * @returns {Array} Array of calculators in builder format
 */
export function getCalculatorsForBuilder() {
  try {
    const savedCalculators = JSON.parse(localStorage.getItem('bonimi_calculators') || '[]');
    return savedCalculators.map(transformCalculatorForBuilder);
  } catch (error) {
    console.error('Error loading calculators from localStorage:', error);
    return [];
  }
}
