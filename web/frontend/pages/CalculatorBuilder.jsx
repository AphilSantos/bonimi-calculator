import React, { useState, useRef, useEffect } from 'react';
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
  const canvasRef = useRef(null);

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

  // Drag preview state
  const [dragPreview, setDragPreview] = useState(null);

  // Handle drag over with preview
  const handleDragOver = (e) => {
    e.preventDefault();
    
    // Show preview for moving elements
    const moveData = e.dataTransfer.getData('moveElement');
    if (moveData) {
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;
      
      const nearestPosition = findNearestPosition(dropX, dropY);
      setDragPreview({
        x: nearestPosition.x,
        y: nearestPosition.y,
        type: 'move'
      });
    }
  };

  // Clear preview when drag ends
  const handleDragEnd = () => {
    setDragPreview(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const elementData = JSON.parse(e.dataTransfer.getData('element'));
    
    // Find the next available position using grid snapping
    const nextPosition = findNextAvailablePosition();
    
    const newElement = {
      ...elementData,
      id: `${elementData.type}-${Date.now()}`,
      position: nextPosition,
      config: { ...elementData.defaultConfig }
    };
    
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement);
  };

  // Handle moving existing elements on the canvas
  const handleElementDragStart = (e, element) => {
    e.stopPropagation();
    e.dataTransfer.setData('moveElement', JSON.stringify(element));
    setSelectedElement(element);
  };

  const handleElementDragOver = (e) => {
    e.preventDefault();
  };

  const handleElementDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const moveData = e.dataTransfer.getData('moveElement');
    if (moveData) {
      const elementToMove = JSON.parse(moveData);
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;
      
      // Find the nearest available grid position
      const nearestPosition = findNearestPosition(dropX, dropY);
      
      // Use the reordering system to handle the move
      handleComponentReorder(elementToMove, nearestPosition);
    }
  };

  // Handle removing elements from canvas
  const handleRemoveElement = (elementId) => {
    setCanvasElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
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
    
    // Also update the selectedElement to reflect changes immediately in the properties panel
    setSelectedElement(prev => 
      prev && prev.id === elementId 
        ? { ...prev, config: { ...prev.config, ...config } }
        : prev
    );
  };

  const handleSaveCalculator = () => {
    if (!calculatorName.trim()) {
      alert('Please enter a calculator name');
      return;
    }

    if (canvasElements.length === 0) {
      alert('Please add at least one element to your calculator');
      return;
    }

    const calculatorData = {
      id: `calc_${Date.now()}`,
      name: calculatorName,
      description: `Custom calculator for ${calculatorName}`,
      formula,
      formulaLabel,
      minFormulaValue: parseFloat(minFormulaValue) || 0,
      elements: canvasElements,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage for now (in production, this would go to your backend)
    try {
      const existingCalculators = JSON.parse(localStorage.getItem('bonimi_calculators') || '[]');
      const updatedCalculators = [...existingCalculators, calculatorData];
      localStorage.setItem('bonimi_calculators', JSON.stringify(updatedCalculators));
      
      console.log('Calculator saved successfully:', calculatorData);
      alert(`Calculator "${calculatorName}" saved successfully!`);
      
      // Reset form
      setCalculatorName(`New Calculator_${new Date().toISOString().split('T')[0]}_${Math.floor(Math.random() * 100)}`);
      setFormula('');
      setCanvasElements([]);
      setSelectedElement(null);
    } catch (error) {
      console.error('Error saving calculator:', error);
      alert('Error saving calculator. Please try again.');
    }
  };

  const renderCanvasElement = (element) => {
    const baseStyle = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      padding: '20px',
      border: selectedElement?.id === element.id ? '3px solid #007cba' : '2px solid #e1e3e5',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'move', // Changed from 'pointer' to 'move' to indicate draggable
      width: '400px', // Fixed width for consistent column layout
      minHeight: '80px',
      boxShadow: selectedElement?.id === element.id 
        ? '0 4px 12px rgba(0, 124, 186, 0.3)' 
        : '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      zIndex: selectedElement?.id === element.id ? 10 : 1
    };

    try {
      switch (element.type) {
        case 'text-input':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Text Input'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <input
                type={element.config?.type || 'text'}
                placeholder={element.config?.placeholder || 'Enter text...'}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e1e3e5', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled
              />
            </div>
          );
        
        case 'select':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Dropdown'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <select style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #e1e3e5', 
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }} disabled>
                {(element.config?.options || ['Option 1', 'Option 2']).map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        
        case 'number-input':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Number Input'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <input
                type="number"
                placeholder={element.config?.placeholder || 'Enter number...'}
                min={element.config?.min || 0}
                max={element.config?.max || 1000}
                step={element.config?.step || 1}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e1e3e5', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                disabled
              />
            </div>
          );
        
        case 'checkbox':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Checkbox'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={element.config?.checked || false} 
                  disabled 
                />
                {element.config?.label || 'Checkbox option'}
              </label>
            </div>
          );

        case 'text-block':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  Text Block
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <Text variant="bodyMd" style={{ 
                fontSize: element.config?.fontSize || '16px', 
                color: element.config?.color || '#000000',
                lineHeight: '1.4'
              }}>
                {element.config?.text || 'Enter your text here'}
              </Text>
            </div>
          );
        
        case 'radio':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Radio Group'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(element.config?.options || ['Option 1', 'Option 2', 'Option 3']).map((opt, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input type="radio" name={element.id} value={opt} disabled />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          );
        
        case 'file-upload':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Upload File'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ 
                border: '2px dashed #e1e3e5', 
                borderRadius: '6px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <Text variant="bodySm" color="subdued">Click to upload file</Text>
              </div>
            </div>
          );
        
        case 'photo-editor':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Photo Editor'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ 
                border: '2px dashed #e1e3e5', 
                borderRadius: '6px', 
                padding: '16px', 
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <Text variant="bodySm" color="subdued">Click to upload photo</Text>
              </div>
            </div>
          );
        
        case 'calculation-display':
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">
                  {element.config?.label || 'Calculation Display'}
                </Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Calculated result will appear here"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e1e3e5', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb'
                }}
                disabled
              />
            </div>
          );
        
        default:
          return (
            <div 
              key={element.id} 
              style={baseStyle} 
              onClick={() => handleElementSelect(element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
              onDragOver={handleElementDragOver}
              onDrop={handleElementDrop}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text variant="bodyMd" fontWeight="semibold">{element.name || 'Element'}</Text>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    opacity: 0.6,
                    ':hover': { opacity: 1 }
                  }}>
                    ✏️
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(element.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#d82c0d',
                      opacity: 0.6,
                      ':hover': { opacity: 1 }
                    }}
                    title="Remove element"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering element:', error, element);
      return (
        <div key={element.id} style={baseStyle} onClick={() => handleElementSelect(element)}>
          <Text variant="bodyMd" color="critical">Error rendering {element.name}</Text>
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
                   value={selectedElement.config?.min ?? 0}
                   onChange={(value) => handleElementConfigChange(selectedElement.id, { min: parseInt(value) || 0 })}
                 />
                 <TextField
                   label="Maximum Value"
                   type="number"
                   value={selectedElement.config?.max ?? 1000}
                   onChange={(value) => handleElementConfigChange(selectedElement.id, { max: parseInt(value) || 0 })}
                 />
                 <TextField
                   label="Step"
                   type="number"
                   value={selectedElement.config?.step ?? 1}
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
      <div key={`properties-${selectedElement.id}`} style={{ padding: '16px' }}>
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

  // Grid snapping configuration
  const gridSize = 40; // Grid cell size in pixels
  const componentSpacing = 40; // Vertical spacing between components (increased from 20px)
  const componentWidth = 400; // Standard component width
  const componentHeight = 80; // Standard component height
  const canvasWidth = 800; // Canvas width for horizontal centering

  // Calculate available grid positions
  const getAvailablePositions = () => {
    const positions = [];
    const maxComponents = 10; // Maximum number of components that can fit
    
    for (let i = 0; i < maxComponents; i++) {
      const y = i * (componentHeight + componentSpacing);
      const x = Math.max(40, (canvasWidth - componentWidth) / 2); // Center horizontally
      positions.push({ x, y, index: i });
    }
    
    return positions;
  };

  // Find the nearest available position
  const findNearestPosition = (dropX, dropY) => {
    const availablePositions = getAvailablePositions();
    let nearestPosition = availablePositions[0];
    let minDistance = Infinity;
    
    availablePositions.forEach(position => {
      const distance = Math.sqrt(
        Math.pow(dropX - position.x, 2) + Math.pow(dropY - position.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPosition = position;
      }
    });
    
    return nearestPosition;
  };

  // Check if a position is occupied
  const isPositionOccupied = (x, y) => {
    return canvasElements.some(element => 
      Math.abs(element.position.x - x) < 10 && Math.abs(element.position.y - y) < 10
    );
  };

  // Find the next available position
  const findNextAvailablePosition = () => {
    const availablePositions = getAvailablePositions();
    
    for (let position of availablePositions) {
      if (!isPositionOccupied(position.x, position.y)) {
        return position;
      }
    }
    
    // If all positions are occupied, find the last position and add spacing
    const lastElement = canvasElements[canvasElements.length - 1];
    if (lastElement) {
      return {
        x: lastElement.position.x,
        y: lastElement.position.y + componentHeight + componentSpacing,
        index: canvasElements.length
      };
    }
    
    return availablePositions[0];
  };

  // Handle component reordering when moved
  const handleComponentReorder = (movedElement, newPosition) => {
    // Find the target index based on the new position
    const targetIndex = Math.round(newPosition.y / (componentHeight + componentSpacing));
    
    // Create a new array with the moved element
    const newElements = canvasElements.filter(el => el.id !== movedElement.id);
    
    // Insert the moved element at the target position
    newElements.splice(targetIndex, 0, {
      ...movedElement,
      position: newPosition
    });
    
    // Reorder all elements to maintain proper spacing
    const reorderedElements = newElements.map((element, index) => {
      const position = getAvailablePositions()[index] || getAvailablePositions()[0];
      return {
        ...element,
        position: { x: position.x, y: position.y }
      };
    });
    
    setCanvasElements(reorderedElements);
  };

  // Auto-reorder elements when they change
  useEffect(() => {
    if (canvasElements.length > 0) {
      // Only reorder if elements are not properly positioned
      const needsReordering = canvasElements.some((element, index) => {
        const expectedPosition = getAvailablePositions()[index];
        return expectedPosition && (
          Math.abs(element.position.x - expectedPosition.x) > 5 ||
          Math.abs(element.position.y - expectedPosition.y) > 5
        );
      });
      
      if (needsReordering) {
        const reorderedElements = canvasElements.map((element, index) => {
          const position = getAvailablePositions()[index] || getAvailablePositions()[0];
          return {
            ...element,
            position: { x: position.x, y: position.y }
          };
        });
        setCanvasElements(reorderedElements);
      }
    }
  }, [canvasElements.length]);

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.6; transform: scale(1); }
          }
        `}
      </style>
      
             <div style={{ 
         height: '100vh', 
         display: 'flex', 
         flexDirection: 'column'
       }}>
      
    <Page
      title="Calculator Builder"
      subtitle="Create custom pricing calculators with drag-and-drop interface"
      fullWidth
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
          <div style={{ display: 'flex', gap: '32px', minHeight: '900px', width: '100%' }}>
            {/* Left Sidebar - Elements */}
            <div style={{ width: '400px', flexShrink: 0 }}>
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
                                     onSelect={setLeftActiveTab}
                >
                  
                  {leftActiveTab === 0 && (
                   <div style={{ padding: '32px' }}>
                     <VerticalStack gap="6">
                       <Text variant="headingLg" fontWeight="semibold">
                         Available Elements ({availableElements.length})
                       </Text>
                       <Text variant="bodyLg" color="subdued">
                         Drag elements onto the canvas to build your calculator
                       </Text>
                     </VerticalStack>
                      
                      <div style={{ 
                        marginTop: '32px',
                        maxHeight: '600px', // Fixed height to prevent panel from growing too tall
                        overflowY: 'auto', // Make it scrollable
                        paddingRight: '8px' // Add some padding for the scrollbar
                      }}>
                        
                        
                        {availableElements && availableElements.length > 0 ? (
                                                                                availableElements.map((element, index) => (
                                <div
                                  key={element.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, element)}
                                  style={{
                                    padding: '24px',
                                    border: '2px solid #e1e3e5',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    cursor: 'grab',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    transition: 'all 0.2s ease',
                                    ':hover': {
                                      borderColor: '#007cba',
                                      boxShadow: '0 4px 16px rgba(0, 124, 186, 0.2)'
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#007cba';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 124, 186, 0.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e1e3e5';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    backgroundColor: '#f6f6f7',
                                    borderRadius: '10px',
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
                                    <Text variant="bodyMd" color="subdued" style={{ marginTop: '4px' }}>
                                      {element.description}
                                    </Text>
                                  </div>
                                </div>
                              ))
                        ) : (
                          <div style={{ 
                            padding: '32px', 
                            textAlign: 'center', 
                            color: '#6d7175',
                            backgroundColor: '#f6f6f7',
                            borderRadius: '12px'
                          }}>
                            <Text variant="bodyLg">No elements available</Text>
                            <Text variant="bodyMd" color="subdued">
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <LegacyCard>
                {/* Grid Legend */}
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  backgroundColor: '#f6f6f7',
                  borderRadius: '8px',
                  border: '1px solid #e1e3e5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px dashed rgba(0, 124, 186, 0.3)',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 124, 186, 0.05)'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#6d7175' }}>Available Position</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px dashed rgba(0, 124, 186, 0.6)',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 124, 186, 0.1)'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#6d7175' }}>Occupied Position</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6d7175', fontStyle: 'italic' }}>
                    Components automatically snap to grid positions for organized layout
                  </div>
                </div>
                
                                 <div
                   ref={canvasRef}
                   style={{
                     minHeight: '900px',
                     height: 'auto',
                     backgroundColor: '#fafafa',
                     border: '4px dashed #e1e3e5',
                     borderRadius: '16px',
                     position: 'relative',
                     overflow: 'auto',
                     backgroundImage: `
                       linear-gradient(rgba(0, 124, 186, 0.1) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(0, 124, 186, 0.1) 1px, transparent 1px)
                     `,
                     backgroundSize: `${gridSize}px ${gridSize}px`,
                     cursor: 'default'
                   }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragEnd}
                  onDrop={(e) => {
                    const moveData = e.dataTransfer.getData('moveElement');
                    if (moveData) {
                      handleElementDrop(e);
                    } else {
                      handleDrop(e);
                    }
                    handleDragEnd();
                  }}
                >
                  {/* Drag Preview */}
                  {dragPreview && (
                    <div
                      style={{
                        position: 'absolute',
                        left: dragPreview.x,
                        top: dragPreview.y,
                        width: componentWidth,
                        height: componentHeight,
                        border: '3px solid #007cba',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 124, 186, 0.1)',
                        zIndex: 10,
                        pointerEvents: 'none',
                        animation: 'pulse 1s infinite'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#007cba',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        Drop Here
                      </div>
                    </div>
                  )}
                  
                  {/* Grid Position Indicators */}
                  {getAvailablePositions().map((position, index) => {
                    const isOccupied = isPositionOccupied(position.x, position.y);
                    return (
                      <div
                        key={`grid-${index}`}
                        style={{
                          position: 'absolute',
                          left: position.x,
                          top: position.y,
                          width: componentWidth,
                          height: componentHeight,
                          border: `2px dashed ${isOccupied ? 'rgba(0, 124, 186, 0.6)' : 'rgba(0, 124, 186, 0.3)'}`,
                          borderRadius: '8px',
                          backgroundColor: isOccupied ? 'rgba(0, 124, 186, 0.1)' : 'rgba(0, 124, 186, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isOccupied ? 'rgba(0, 124, 186, 0.8)' : 'rgba(0, 124, 186, 0.5)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          zIndex: 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isOccupied ? '●' : '○'}
                      </div>
                    );
                  })}
                  
                                     {/* Canvas Elements */}
                   <div style={{ 
                     position: 'relative', 
                     width: '100%', 
                     height: 'auto',
                     minHeight: '900px',
                     paddingBottom: '100px' // Add padding at bottom for better scrolling
                   }}>
                     {canvasElements.map(renderCanvasElement)}
                   </div>
                  
                  {/* Empty State */}
                  {canvasElements.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      color: '#6d7175',
                      zIndex: 2
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Drag elements here to build your calculator
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        Components will snap to grid positions for organized layout
                      </div>
                    </div>
                  )}
                </div>
              </LegacyCard>
            </div>

            {/* Right Sidebar - Configuration */}
            <div style={{ width: '450px', flexShrink: 0 }}>
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
                   <div style={{ padding: '32px' }}>
                     <VerticalStack gap="6">
                       <div>
                         <Text variant="headingLg" fontWeight="semibold">
                           Formula Configuration
                         </Text>
                         <Text variant="bodyLg" color="subdued">
                           Define the mathematical formula for calculating prices
                         </Text>
                       </div>
                       
                       <TextField
                         label="Formula"
                         value={formula}
                         onChange={setFormula}
                         placeholder="e.g., basePrice + (length * width * 0.15) + (materialMultiplier * length * width)"
                         multiline={6}
                         helpText="Use mathematical operators: +, -, *, /, () and variable names"
                       />
                       
                       <div style={{ 
                         padding: '24px', 
                         backgroundColor: '#f6f6f7', 
                         borderRadius: '12px',
                         fontSize: '16px'
                       }}>
                         <Text variant="bodyLg" fontWeight="semibold">Formula Tips:</Text>
                         <ul style={{ margin: '16px 0 0 28px', padding: 0, lineHeight: '1.6' }}>
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
                   <div style={{ padding: '32px' }}>
                     <VerticalStack gap="5">
                       <div>
                         <Text variant="headingLg" fontWeight="semibold">
                           Product Association
                         </Text>
                         <Text variant="bodyLg" color="subdued">
                           Link this calculator to specific Shopify products
                         </Text>
                       </div>
                       
                       <div style={{ 
                         padding: '32px', 
                         backgroundColor: '#f6f6f7', 
                         borderRadius: '12px',
                         textAlign: 'center'
                       }}>
                         <Text variant="bodyLg" color="subdued">
                           Product association feature coming soon...
                         </Text>
                       </div>
                     </VerticalStack>
                   </div>
                 )}
                 
                  {rightActiveTab === 2 && (
                    <div style={{ padding: '32px' }}>
                      <VerticalStack gap="5">
                        <div>
                          <Text variant="headingLg" fontWeight="semibold">
                            Advanced Configuration
                          </Text>
                          <Text variant="bodyLg" color="subdued">
                            Additional settings and options
                          </Text>
                        </div>
                        
                        <div style={{ 
                          padding: '32px', 
                          backgroundColor: '#f6f6f7', 
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}>
                          <Text variant="bodyLg" color="subdued">
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
      </div>
    </>
  );
}
