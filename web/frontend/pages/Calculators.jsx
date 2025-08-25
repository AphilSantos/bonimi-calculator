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

  // Fetch calculators from API
  useEffect(() => {
    fetchCalculators();
  }, []);

  const fetchCalculators = async () => {
    try {
      const response = await fetch('/api/calculators');
      if (response.ok) {
        const data = await response.json();
        setCalculators(data);
      }
    } catch (error) {
      console.error('Failed to fetch calculators:', error);
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
      const url = editingCalculator 
        ? `/api/calculators/${editingCalculator.id}`
        : '/api/calculators';
      
      const method = editingCalculator ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchCalculators(); // Refresh the list
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        console.error('Failed to save calculator:', error);
      }
    } catch (error) {
      console.error('Failed to save calculator:', error);
    }
  };

  const handleDeleteCalculator = async (id) => {
    try {
      const response = await fetch(`/api/calculators/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchCalculators(); // Refresh the list
      } else {
        console.error('Failed to delete calculator');
      }
    } catch (error) {
      console.error('Failed to delete calculator:', error);
    }
  };

  const rows = calculators.map(calculator => [
    calculator.name,
    calculator.description,
    calculator.formula,
    calculator.fields.map(f => typeof f === 'string' ? f : f.name).join(', '),
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
