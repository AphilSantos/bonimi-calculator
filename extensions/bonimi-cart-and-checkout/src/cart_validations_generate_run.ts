import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const operations: any[] = [];
  
  // Process each cart line for calculator-based pricing
  input.cart.lines.forEach((line, index) => {
    // Check if this line has custom calculator configuration
    const calculatorConfig = line.attributes?.find(attr => 
      attr.key === 'calculator_config'
    );
    
    if (calculatorConfig) {
      try {
        const config = JSON.parse(calculatorConfig.value);
        
        // Apply calculated price transformation
        operations.push({
          cartLinesTransform: {
            id: line.id,
            quantity: line.quantity,
            cost: {
              amountPerQuantity: {
                amount: config.calculatedPrice.toString(),
                currencyCode: "USD" // In production, get from cart
              }
            },
            attributes: [
              {
                key: "custom_configuration",
                value: JSON.stringify(config.fields)
              },
              {
                key: "original_price",
                value: line.cost?.amountPerQuantity?.amount || "0"
              }
            ]
          }
        });
      } catch (error) {
        // Add validation error if configuration is invalid
        operations.push({
          validationAdd: {
            errors: [{
              message: "Invalid calculator configuration",
              target: `$.cart.lines[${index}]`,
            }]
          }
        });
      }
    }
  });

  return { operations };
};