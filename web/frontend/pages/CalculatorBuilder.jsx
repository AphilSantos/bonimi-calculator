import React, { useState, useRef } from 'react';
import { 
  Page, 
  Layout, 
  LegacyCard, 
  Text, 
  VerticalStack, 
  Button, 
  TextField, 
  Select,
  Tabs,
  Badge,
  Icon,
  ButtonGroup
} from '@shopify/polaris';
import { 
  ArrowLeftMinor, 
  ViewMinor,
  PlusMinor,
  AnalyticsMinor,
  AppsMinor,
  PackageMajor,
  SettingsMinor,
  CirclePlusMinor,
  CircleTickMinor
} from '@shopify/polaris-icons';

export default function CalculatorBuilder() {
  const [calculatorName, setCalculatorName] = useState('New Calculator_August_2025_97');
  const [leftActiveTab, setLeftActiveTab] = useState(0);
  const [rightActiveTab, setRightActiveTab] = useState(0);
  const [formula, setFormula] = useState('');
  const [formulaLabel, setFormulaLabel] = useState('Price');
  const [minFormulaValue, setMinFormulaValue] = useState('');
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('CalculatorBuilder mounted');
    console.log('availableElements:', availableElements);
    console.log('leftActiveTab:', leftActiveTab, 'type:', typeof leftActiveTab);
  }, [leftActiveTab]);

  // Available UI elements that can be dragged onto the canvas
  const availableElements = [
    {
      id: 'radio',
      type: 'radio',
      icon: 'radio',
      name: 'Radio',
      description: 'Select one value from a list of options.',
      defaultConfig: {
        label: 'Radio Group',
        options: ['Option 1', 'Option 2', 'Option 3'],
        required: false
      }
    },
    {
      id: 'text-block',
      type: 'text-block',
      icon: 'text-block',
      name: 'Text Block',
      description: 'Display any text.',
      defaultConfig: {
        text: 'Enter your text here',
        fontSize: '16px',
        color: '#000000'
      }
    },
    {
      id: 'file-upload',
      type: 'file-upload',
      icon: 'file-upload',
      name: 'File Upload',
      description: 'Upload local files.',
      defaultConfig: {
        label: 'Upload File',
        accept: '*/*',
        multiple: false,
        required: false
      }
    },
    {
      id: 'photo-editor',
      type: 'photo-editor',
      icon: 'photo-editor',
      name: 'Photo Editor',
      description: 'Upload and edit uploaded images.',
      defaultConfig: {
        label: 'Upload Photo',
        accept: 'image/*',
        maxSize: '5MB',
        required: false
      }
    },
    {
      id: 'text-input',
      type: 'text-input',
      icon: 'text-input',
      name: 'Text Input',
      description: 'Insert any text.',
      defaultConfig: {
        label: 'Text Input',
        placeholder: 'Enter text...',
        type: 'text',
        required: false
      }
    },
    {
      id: 'select',
      type: 'select',
      icon: 'select',
      name: 'Select Dropdown',
      description: 'Choose from a list of options.',
      defaultConfig: {
        label: 'Select Option',
        options: ['Option 1', 'Option 2', 'Option 3'],
        required: false
      }
    },
    {
      id: 'checkbox',
      type: 'checkbox',
      icon: 'checkbox',
      name: 'Checkbox',
      description: 'A simple checkbox to make a binary choice.',
      defaultConfig: {
        label: 'Checkbox',
        checked: false,
        required: false
      }
    },
    {
      id: 'number-input',
      type: 'number-input',
      icon: 'number-input',
      name: 'Number Input',
      description: 'Input numeric values for calculations.',
      defaultConfig: {
        label: 'Number Input',
        placeholder: 'Enter number...',
        min: 0,
        max: 1000,
        step: 1,
        required: false
      }
    },
    {
      id: 'calculation-display',
      type: 'calculation-display',
      icon: 'calculation-display',
      name: 'Calculation Display',
      description: 'Display a calculation based on inputs.',
      defaultConfig: {
        label: 'Total Price',
        formula: 'basePrice + (length * width * 0.15)',
        currency: 'GBP',
        fontSize: '18px'
      }
    }
  ];

  // Formula suggestions for the formula editor
  const formulaSuggestions = [
    'basePrice',
    'length',
    'width',
    'height',
    'quantity',
    'materialMultiplier',
    'edgeFinishing',
    'bracketCost',
    'numberOfBrackets'
  ];

  const handleDragStart = (e, element) => {
    e.dataTransfer.setData('element', JSON.stringify(element));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const elementData = JSON.parse(e.dataTransfer.getData('element'));
    const newElement = {
      ...elementData,
      id: `${elementData.type}-${Date.now()}`,
      position: { x: e.clientX - 200, y: e.clientY - 100 },
      config: { ...elementData.defaultConfig }
    };
    setCanvasElements([...canvasElements, newElement]);
  };

  const handleElementSelect = (element) => {
    setSelectedElement(element);
  };

  const handleElementConfigChange = (elementId, config) => {
    setCanvasElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, config: { ...el.config, ...config } } : el
      )
    );
  };

  const handleSaveCalculator = () => {
    const calculatorData = {
      name: calculatorName,
      formula,
      formulaLabel,
      minFormulaValue: parseFloat(minFormulaValue) || 0,
      elements: canvasElements,
      status: 'draft'
    };
    console.log('Saving calculator:', calculatorData);
    // Here you would save to your backend
    alert('Calculator saved successfully!');
  };

  const renderCanvasElement = (element) => {
    const baseStyle = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      padding: '8px',
      border: selectedElement?.id === element.id ? '2px solid #007cba' : '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      minWidth: '120px',
      minHeight: '40px'
    };

    try {
      switch (element.type) {
        case 'text-input':
          return (
            <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
              <Text variant="bodyMd" fontWeight="semibold">{element.config?.label || 'Text Input'}</Text>
              <input
                type={element.config?.type || 'text'}
                placeholder={element.config?.placeholder || 'Enter text...'}
                style={{ width: '100%', marginTop: '4px' }}
                disabled
              />
            </div>
          );
        
                 case 'select':
           return (
             <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
               <Text variant="bodyMd" fontWeight="semibold">{element.config?.label || 'Select'}</Text>
               <select style={{ width: '100%', marginTop: '4px' }} disabled>
                 {(element.config?.options || ['Option 1', 'Option 2']).map((opt, idx) => (
                   <option key={idx} value={opt}>{opt}</option>
                 ))}
               </select>
             </div>
           );
         
         case 'number-input':
           return (
             <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
               <Text variant="bodyMd" fontWeight="semibold">{element.config?.label || 'Number Input'}</Text>
               <input
                 type="number"
                 placeholder={element.config?.placeholder || 'Enter number...'}
                 min={element.config?.min || 0}
                 max={element.config?.max || 1000}
                 step={element.config?.step || 1}
                 style={{ width: '100%', marginTop: '4px' }}
                 disabled
               />
             </div>
           );
        
        case 'text-block':
          return (
            <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
              <Text variant="bodyMd" style={{ fontSize: element.config?.fontSize || '16px', color: element.config?.color || '#000000' }}>
                {element.config?.text || 'Enter your text here'}
              </Text>
            </div>
          );
        
        case 'calculation-display':
          return (
            <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
              <Text variant="bodyMd" fontWeight="semibold">{element.config?.label || 'Total Price'}</Text>
              <Text variant="headingMd" style={{ fontSize: element.config?.fontSize || '18px' }}>
                £0.00
              </Text>
            </div>
          );
        
        default:
          return (
            <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
              <Text variant="bodyMd">{element.name || 'Element'}</Text>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering element:', error, element);
      return (
        <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
          <Text variant="bodyMd" color="critical">Error rendering element</Text>
        </div>
      );
    }
  };

  const renderPropertiesPanel = () => {
    if (!selectedElement) {
      return (
        <div style={{ padding: '16px', textAlign: 'center', color: '#6d7175' }}>
          <Text variant="bodyMd">Select an element to configure its properties</Text>
        </div>
      );
    }

    const renderConfigFields = () => {
      try {
        switch (selectedElement.type) {
          case 'text-input':
            return (
              <VerticalStack gap="3">
                <TextField
                  label="Label"
                  value={selectedElement.config?.label || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { label: value })}
                />
                <TextField
                  label="Placeholder"
                  value={selectedElement.config?.placeholder || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { placeholder: value })}
                />
                <Select
                  label="Input Type"
                  options={[
                    { label: 'Text', value: 'text' },
                    { label: 'Number', value: 'number' },
                    { label: 'Email', value: 'email' },
                    { label: 'Phone', value: 'tel' }
                  ]}
                  value={selectedElement.config?.type || 'text'}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { type: value })}
                />
                <Select
                  label="Required"
                  options={[
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                  value={selectedElement.config?.required?.toString() || 'false'}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { required: value === 'true' })}
                />
              </VerticalStack>
            );
          
          case 'select':
            return (
              <VerticalStack gap="3">
                <TextField
                  label="Label"
                  value={selectedElement.config?.label || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { label: value })}
                />
                <TextField
                  label="Options (comma-separated)"
                  value={(selectedElement.config?.options || []).join(', ')}
                  onChange={(value) => {
                    const options = value.split(',').map(opt => opt.trim()).filter(opt => opt);
                    handleElementConfigChange(selectedElement.id, { options });
                  }}
                  placeholder="Option 1, Option 2, Option 3"
                />
                <Select
                  label="Required"
                  options={[
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                  value={selectedElement.config?.required?.toString() || 'false'}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { required: value === 'true' })}
                />
              </VerticalStack>
            );
          
          case 'number-input':
            return (
              <VerticalStack gap="3">
                <TextField
                  label="Label"
                  value={selectedElement.config?.label || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { label: value })}
                />
                <TextField
                  label="Placeholder"
                  value={selectedElement.config?.placeholder || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { placeholder: value })}
                />
                <TextField
                  label="Minimum Value"
                  type="number"
                  value={selectedElement.config?.min || 0}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { min: parseInt(value) || 0 })}
                />
                <TextField
                  label="Maximum Value"
                  type="number"
                  value={selectedElement.config?.max || 1000}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { max: parseInt(value) || 1000 })}
                />
                <TextField
                  label="Step"
                  type="number"
                  value={selectedElement.config?.step || 1}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { step: parseInt(value) || 1 })}
                />
              </VerticalStack>
            );
          
          case 'calculation-display':
            return (
              <VerticalStack gap="3">
                <TextField
                  label="Label"
                  value={selectedElement.config?.label || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { label: value })}
                />
                <TextField
                  label="Formula"
                  value={selectedElement.config?.formula || ''}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { formula: value })}
                  multiline={2}
                />
                <Select
                  label="Currency"
                  options={[
                    { label: 'GBP (£)', value: 'GBP' },
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'EUR (€)', value: 'EUR' }
                  ]}
                  value={selectedElement.config?.currency || 'GBP'}
                  onChange={(value) => handleElementConfigChange(selectedElement.id, { currency: value })}
                />
              </VerticalStack>
            );
          
          default:
            return (
              <Text variant="bodyMd">Configuration options for this element type are not yet implemented.</Text>
            );
        }
      } catch (error) {
        console.error('Error rendering config fields:', error);
        return (
          <Text variant="bodyMd" color="critical">
            Error loading configuration options. Please try selecting the element again.
          </Text>
        );
      }
    };

    return (
      <div style={{ padding: '16px' }}>
        <VerticalStack gap="4">
          <div>
            <Text variant="headingMd" fontWeight="semibold">
              {selectedElement.name || 'Element'} Properties
            </Text>
            <Text variant="bodyMd" color="subdued">
              Configure the properties for this element
            </Text>
          </div>
          {renderConfigFields()}
        </VerticalStack>
      </div>
    );
  };

  return (
    <Page
      title="Calculator Builder"
      subtitle="Create custom pricing calculators with drag-and-drop interface"
      backAction={{
        content: 'Back',
        icon: ArrowLeftMinor,
        onAction: () => window.history.back()
      }}
      primaryAction={{
        content: 'Save Calculator',
        onAction: handleSaveCalculator
      }}
      secondaryActions={[
        {
          content: 'Test Calculator',
          onAction: () => window.location.href = '/calculatorDemo'
        },
        {
          content: 'Preview',
          icon: ViewMinor,
          onAction: () => setShowPreview(!showPreview)
        }
      ]}
    >
      <Layout>
        {/* Calculator Header */}
        <Layout.Section>
          <LegacyCard sectioned>
            <VerticalStack gap="3">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon source={AnalyticsMinor} />
                <TextField
                  label=""
                  value={calculatorName}
                  onChange={setCalculatorName}
                  placeholder="Enter calculator name"
                  style={{ flex: 1 }}
                />
              </div>
            </VerticalStack>
          </LegacyCard>
        </Layout.Section>

        {/* Main Builder Interface */}
        <Layout.Section>
          <div style={{ display: 'flex', gap: '16px', minHeight: '600px' }}>
            {/* Left Sidebar - Elements */}
            <div style={{ width: '280px', flexShrink: 0 }}>
              <LegacyCard>
                                                  <Tabs
                   tabs={[
                     {
                       id: 0,
                       content: 'Elements',
                       icon: PlusMinor
                     },
                     {
                       id: 1,
                       content: 'Properties',
                       icon: SettingsMinor
                     }
                   ]}
                   selected={leftActiveTab}
                   onSelect={(selected) => {
                     console.log('Tab selected:', selected, 'type:', typeof selected);
                     setLeftActiveTab(selected);
                   }}
                 >
                   {console.log('Tab check - leftActiveTab:', leftActiveTab, '=== 0:', leftActiveTab === 0)}
                   {leftActiveTab === 0 && (
                    <div style={{ padding: '16px' }}>
                      <VerticalStack gap="3">
                        <Text variant="headingMd" fontWeight="semibold">
                          Available Elements ({availableElements.length})
                        </Text>
                        <Text variant="bodyMd" color="subdued">
                          Drag elements onto the canvas to build your calculator
                        </Text>
                      </VerticalStack>
                      
                                             <div style={{ marginTop: '16px' }}>
                         {console.log('Rendering elements:', availableElements)}
                         
                         {/* Test element to verify rendering works */}
                         <div style={{
                           padding: '12px',
                           border: '2px solid red',
                           borderRadius: '6px',
                           marginBottom: '8px',
                           backgroundColor: 'yellow',
                           textAlign: 'center'
                         }}>
                           <Text variant="bodyMd" fontWeight="semibold">TEST ELEMENT - This should be visible!</Text>
                         </div>
                         
                         {availableElements && availableElements.length > 0 ? (
                           availableElements.map((element, index) => {
                             console.log(`Rendering element ${index}:`, element);
                             return (
                               <div
                                 key={element.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, element)}
                                 style={{
                                   padding: '12px',
                                   border: '1px solid #e1e3e5',
                                   borderRadius: '6px',
                                   marginBottom: '8px',
                                   cursor: 'grab',
                                   backgroundColor: 'white',
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: '12px'
                                 }}
                               >
                                 <div style={{ 
                                   width: '24px', 
                                   height: '24px', 
                                   backgroundColor: '#f6f6f7',
                                   borderRadius: '4px',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center'
                                 }}>
                                   <Icon source={CirclePlusMinor} />
                                 </div>
                                 <div style={{ flex: 1 }}>
                                   <Text variant="bodyMd" fontWeight="semibold">
                                     {element.name}
                                   </Text>
                                   <Text variant="bodySm" color="subdued">
                                     {element.description}
                                   </Text>
                                 </div>
                               </div>
                             );
                           })
                         ) : (
                           <div style={{ 
                             padding: '16px', 
                             textAlign: 'center', 
                             color: '#6d7175',
                             backgroundColor: '#f6f6f7',
                             borderRadius: '6px'
                           }}>
                             <Text variant="bodyMd">No elements available</Text>
                             <Text variant="bodySm" color="subdued">
                               Elements array: {JSON.stringify(availableElements)}
                             </Text>
                           </div>
                         )}
                       </div>
                    </div>
                  )}
                  
                                                        {leftActiveTab === 1 && renderPropertiesPanel()}
                 </Tabs>
              </LegacyCard>
            </div>

            {/* Center Canvas */}
            <div style={{ flex: 1 }}>
              <LegacyCard>
                <div
                  style={{
                    position: 'relative',
                    minHeight: '600px',
                    backgroundColor: '#f6f6f7',
                    backgroundImage: `
                      linear-gradient(45deg, #f6f6f7 25%, transparent 25%),
                      linear-gradient(-45deg, #f6f6f7 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #f6f6f7 75%),
                      linear-gradient(-45deg, transparent 75%, #f6f6f7 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    border: '2px dashed #c9cccf',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {canvasElements.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6d7175' }}>
                      <Icon source={CirclePlusMinor} style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <Text variant="headingMd">Drag elements here</Text>
                      <Text variant="bodyMd" color="subdued">
                        Start building your calculator by dragging elements from the left sidebar
                      </Text>
                    </div>
                  ) : (
                    canvasElements.map(renderCanvasElement)
                  )}
                </div>
              </LegacyCard>
            </div>

            {/* Right Sidebar - Configuration */}
            <div style={{ width: '320px', flexShrink: 0 }}>
              <LegacyCard>
                                 <Tabs
                   tabs={[
                     {
                       id: 0,
                       content: 'Formula',
                       icon: AnalyticsMinor
                     },
                     {
                       id: 1,
                       content: 'Products',
                       icon: PackageMajor
                     },
                     {
                       id: 2,
                       content: 'Advanced',
                       icon: SettingsMinor
                     }
                   ]}
                   selected={rightActiveTab}
                   onSelect={setRightActiveTab}
                 >
                   {rightActiveTab === 0 && (
                    <div style={{ padding: '16px' }}>
                      <VerticalStack gap="4">
                        <div>
                          <Text variant="headingMd" fontWeight="semibold">
                            Formula Configuration
                          </Text>
                          <Text variant="bodyMd" color="subdued">
                            Define the mathematical formula for calculating prices
                          </Text>
                        </div>
                        
                        <TextField
                          label="Formula"
                          value={formula}
                          onChange={setFormula}
                          placeholder="e.g., basePrice + (length * width * 0.15) + (materialMultiplier * length * width)"
                          multiline={4}
                          helpText="Use mathematical operators: +, -, *, /, () and variable names"
                        />
                        
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#f6f6f7', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>
                          <Text variant="bodyMd" fontWeight="semibold">Formula Tips:</Text>
                          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                            <li>Press tab key to use suggestions</li>
                            <li>Press down arrow key (↓) to switch between suggestions</li>
                            <li><a href="#" style={{ color: '#007cba' }}>Learn more about formulas here</a></li>
                          </ul>
                        </div>
                        
                        <TextField
                          label="Formula Label"
                          value={formulaLabel}
                          onChange={setFormulaLabel}
                          placeholder="Price"
                        />
                        
                        <TextField
                          label="Minimum Formula Value"
                          value={minFormulaValue}
                          onChange={setMinFormulaValue}
                          type="number"
                          placeholder="0"
                          helpText="Optional: Set a minimum value for the calculated result"
                        />
                      </VerticalStack>
                    </div>
                  )}
                  
                                                        {rightActiveTab === 1 && (
                     <div style={{ padding: '16px' }}>
                       <VerticalStack gap="4">
                         <div>
                           <Text variant="headingMd" fontWeight="semibold">
                             Product Association
                           </Text>
                           <Text variant="bodyMd" color="subdued">
                             Link this calculator to specific Shopify products
                           </Text>
                         </div>
                         
                         <div style={{ 
                           padding: '16px', 
                           backgroundColor: '#f6f6f7', 
                           borderRadius: '4px',
                           textAlign: 'center'
                         }}>
                           <Text variant="bodyMd" color="subdued">
                             Product association feature coming soon...
                           </Text>
                         </div>
                       </VerticalStack>
                     </div>
                   )}
                   
                                      {rightActiveTab === 2 && (
                    <div style={{ padding: '16px' }}>
                      <VerticalStack gap="4">
                        <div>
                          <Text variant="headingMd" fontWeight="semibold">
                            Advanced Configuration
                          </Text>
                          <Text variant="bodyMd" color="subdued">
                            Additional settings and options
                          </Text>
                        </div>
                        
                        <div style={{ 
                          padding: '16px', 
                          backgroundColor: '#f6f6f7', 
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}>
                          <Text variant="bodyMd" color="subdued">
                            Advanced configuration options coming soon...
                          </Text>
                        </div>
                      </VerticalStack>
                    </div>
                  )}
                </Tabs>
              </LegacyCard>
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
