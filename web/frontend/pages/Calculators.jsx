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

  // Fetch calculators from localStorage
  useEffect(() => {
    fetchCalculators();
  }, []);

  // Listen for storage changes to refresh calculators when new ones are saved
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bonimi_calculators') {
        console.log('Calculators page: Storage changed, reloading calculators');
        fetchCalculators();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchCalculators = () => {
    try {
      const displayCalculators = getCalculatorsForDisplay();
      console.log('Loaded calculators from localStorage (transformed):', displayCalculators);
      setCalculators(displayCalculators);
    } catch (error) {
      console.error('Failed to fetch calculators from localStorage:', error);
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

  const handleSaveCalculator = () => {
    try {
      const savedCalculators = JSON.parse(localStorage.getItem('bonimi_calculators') || '[]');
      
      if (editingCalculator) {
        // Update existing calculator
        const updatedCalculators = savedCalculators.map(calc => 
          calc.id === editingCalculator.id 
            ? { ...calc, ...formData, updatedAt: new Date().toISOString() }
            : calc
        );
        localStorage.setItem('bonimi_calculators', JSON.stringify(updatedCalculators));
      } else {
        // Create new calculator
        const newCalculator = {
          id: `calc_${Date.now()}`,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const updatedCalculators = [...savedCalculators, newCalculator];
        localStorage.setItem('bonimi_calculators', JSON.stringify(updatedCalculators));
      }
      
      fetchCalculators(); // Refresh the list
      setIsModalOpen(false);
      console.log('Calculator saved successfully to localStorage');
    } catch (error) {
      console.error('Failed to save calculator to localStorage:', error);
    }
  };

  const handleDeleteCalculator = (id) => {
    try {
      const savedCalculators = JSON.parse(localStorage.getItem('bonimi_calculators') || '[]');
      const updatedCalculators = savedCalculators.filter(calc => calc.id !== id);
      localStorage.setItem('bonimi_calculators', JSON.stringify(updatedCalculators));
      
      fetchCalculators(); // Refresh the list
      console.log('Calculator deleted successfully from localStorage');
    } catch (error) {
      console.error('Failed to delete calculator from localStorage:', error);
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
