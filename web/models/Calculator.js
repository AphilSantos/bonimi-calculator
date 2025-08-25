// Simple Calculator model for storing calculator definitions
// In production, you'd use a proper database like PostgreSQL

class Calculator {
  constructor(data = {}) {
    this.id = data.id || Date.now();
    this.name = data.name || '';
    this.description = data.description || '';
    this.formula = data.formula || '';
    this.fields = data.fields || [];
    this.productIds = data.productIds || [];
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validate calculator data
  validate() {
    const errors = [];
    
    if (!this.name.trim()) {
      errors.push('Calculator name is required');
    }
    
    if (!this.formula.trim()) {
      errors.push('Formula is required');
    }
    
    if (!this.fields.length) {
      errors.push('At least one field is required');
    }
    
    return errors;
  }

  // Calculate price based on formula and field values
  calculatePrice(fieldValues, basePrice = 0) {
    try {
      let formula = this.formula;
      
      // Replace field variables with actual values
      this.fields.forEach(field => {
        const value = fieldValues[field.name] || 0;
        const regex = new RegExp(`\\b${field.name}\\b`, 'g');
        formula = formula.replace(regex, value);
      });
      
      // Replace basePrice variable
      formula = formula.replace(/\bbasePrice\b/g, basePrice);
      
      // Remove parentheses and extra spaces
      formula = formula.replace(/[()]/g, '').replace(/\s+/g, '');
      
      // Basic formula evaluation (use mathjs in production)
      // This is a simplified version - in production, use a proper math parser
      let result = 0;
      
      // Handle addition first
      if (formula.includes('+')) {
        const parts = formula.split('+');
        result = parts.reduce((sum, part) => {
          // Handle multiplication within each part
          if (part.includes('*')) {
            const multParts = part.split('*');
            const multResult = multParts.reduce((product, multPart) => 
              product * parseFloat(multPart || 1), 1
            );
            return sum + multResult;
          }
          return sum + parseFloat(part || 0);
        }, 0);
      } else if (formula.includes('*')) {
        // Handle multiplication only
        const parts = formula.split('*');
        result = parts.reduce((product, part) => 
          product * parseFloat(part || 1), 1
        );
      } else {
        result = parseFloat(formula) || 0;
      }
      
      return Math.round(result * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Price calculation error:', error);
      return basePrice;
    }
  }

  // Check if calculator is assigned to a product
  isAssignedToProduct(productId) {
    return this.productIds.includes(productId);
  }

  // Add product assignment
  assignToProduct(productId) {
    if (!this.productIds.includes(productId)) {
      this.productIds.push(productId);
      this.updatedAt = new Date();
    }
  }

  // Remove product assignment
  unassignFromProduct(productId) {
    this.productIds = this.productIds.filter(id => id !== productId);
    this.updatedAt = new Date();
  }

  // Get calculator configuration for frontend
  getConfig() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      fields: this.fields,
      formula: this.formula,
      status: this.status
    };
  }

  // Static method to find calculator by product ID
  static findByProductId(calculators, productId) {
    return calculators.find(calc => calc.isAssignedToProduct(productId));
  }

  // Static method to find calculator by ID
  static findById(calculators, id) {
    return calculators.find(calc => calc.id === id);
  }
}

export default Calculator;
