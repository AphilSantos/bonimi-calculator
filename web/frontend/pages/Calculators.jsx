import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  LegacyCard,
  Button,
  DataTable,
  Modal,
  FormLayout,
  TextField,
  Select,
  VerticalStack,
  Badge,
  Text,
  ButtonGroup,
  EmptyState
} from '@shopify/polaris';
import { PlusMinor } from '@shopify/polaris-icons';
import { useAppBridgeContext } from "../components/providers/AppBridgeProvider";
import { getCalculatorsForDisplay } from '../utils/calculatorDataTransform';

export default function Calculators() {
  const app = useAppBridgeContext();
  const [calculators, setCalculators] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalculator, setEditingCalculator] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formula: '',
    fields: [],
    productIds: []
  });

  // Fetch calculators from database API
  useEffect(() => {
    fetchCalculators();
  }, []);

  const fetchCalculators = async () => {
    try {
      const response = await fetch('/api/calculators');
      if (!response.ok) {
        throw new Error('Failed to fetch calculators');
      }
      const data = await response.json();
      console.log('Loaded calculators from API:', data);
      setCalculators(data);
    } catch (error) {
      console.error('Failed to fetch calculators from API:', error);
      setCalculators([]);
    }
  };

  const handleCreateCalculator = () => {
    setEditingCalculator(null);
    setFormData({
      name: '',
      description: '',
      formula: '',
      fields: [],
      productIds: []
    });
    setIsModalOpen(true);
  };

  const handleEditCalculator = (calculator) => {
    setEditingCalculator(calculator);
    setFormData({
      ...calculator,
      fields: calculator.fields || []
    });
    setIsModalOpen(true);
  };

  const handleSaveCalculator = async () => {
    try {
      if (editingCalculator) {
        // Update existing calculator
        const response = await fetch(`/api/calculators/${editingCalculator.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            elements: formData.fields || formData.elements || []
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update calculator');
        }

        const result = await response.json();
        console.log('Calculator updated successfully:', result.calculator);
      } else {
        // Create new calculator
        const response = await fetch('/api/calculators', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            elements: formData.fields || formData.elements || []
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create calculator');
        }

        const result = await response.json();
        console.log('Calculator created successfully:', result.calculator);
      }
      
      // Refresh calculators list
      fetchCalculators();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving calculator:', error);
      alert('Error saving calculator. Please try again.');
    }
  };

  const handleDeleteCalculator = async (calculatorId) => {
    if (window.confirm('Are you sure you want to delete this calculator?')) {
      try {
        const response = await fetch(`/api/calculators/${calculatorId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete calculator');
        }

        console.log('Calculator deleted successfully');
        
        // Refresh calculators list
        fetchCalculators();
      } catch (error) {
        console.error('Error deleting calculator:', error);
        alert('Error deleting calculator. Please try again.');
      }
    }
  };

  const rows = calculators.map(calculator => [
    calculator.name,
    calculator.description,
    calculator.formula,
    (calculator.fields || calculator.elements || []).map(f => typeof f === 'string' ? f : f.name || f.id).join(', '),
    <Badge status={calculator.status === 'active' ? 'success' : 'warning'}>
      {calculator.status}
    </Badge>,
    <ButtonGroup>
      <Button size="micro" onClick={() => handleEditCalculator(calculator)}>
        Edit
      </Button>
      <Button size="micro" destructive onClick={() => handleDeleteCalculator(calculator.id)}>
        Delete
      </Button>
    </ButtonGroup>
  ]);

  return (
    <Page
      title="Custom Calculators"
      primaryAction={{
        content: 'Create Calculator',
        icon: PlusMinor,
        onAction: handleCreateCalculator
      }}
      secondaryActions={[
        {
          content: 'Refresh',
          onAction: fetchCalculators
        }
      ]}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard>
            {calculators.length > 0 ? (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                headings={['Name', 'Description', 'Formula', 'Fields', 'Status', 'Actions']}
                rows={rows}
              />
            ) : (
              <EmptyState
                heading="Create your first calculator"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Start building custom pricing calculators for your products.</p>
                <Button primary onClick={handleCreateCalculator}>
                  Create Calculator
                </Button>
              </EmptyState>
            )}
          </LegacyCard>
        </Layout.Section>
      </Layout>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCalculator ? 'Edit Calculator' : 'Create Calculator'}
        primaryAction={{
          content: 'Save',
          onAction: handleSaveCalculator
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Calculator Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="e.g., Furniture Dimensions Calculator"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Describe what this calculator does"
              multiline={3}
            />
            <TextField
              label="Formula"
              value={formData.formula}
              onChange={(value) => setFormData(prev => ({ ...prev, formula: value }))}
              placeholder="e.g., basePrice + (length * width * height * 0.01)"
              helpText="Use field names and mathematical operators. Available variables: basePrice, quantity"
            />
            <TextField
              label="Fields (comma-separated)"
              value={formData.fields.map(f => typeof f === 'string' ? f : f.name).join(', ')}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                fields: value.split(',').map(f => f.trim()).filter(f => f).map(fieldName => ({
                  name: fieldName,
                  label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
                  type: 'number',
                  required: true
                }))
              }))}
              placeholder="e.g., length, width, height, material"
              helpText="These will be the input fields shown to customers"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
