import React from 'react';
import { Button, Text } from '@shopify/polaris';
import { 
  HomeMinor, 
  ProductsMinor, 
  AnalyticsMinor, 
  AppsMinor 
} from '@shopify/polaris-icons';

export default function AppNavigation() {
  const navItems = [
    { label: 'Home', icon: HomeMinor, url: '/', active: window.location.pathname === '/' },
    { label: 'Products', icon: ProductsMinor, url: '/products', active: window.location.pathname === '/products' },
    { label: 'Create Calculator', icon: AppsMinor, url: '/calculatorBuilder', active: window.location.pathname === '/calculatorBuilder' },
    { label: 'Customer Calculator', icon: AnalyticsMinor, url: '/customerCalculator', active: window.location.pathname === '/customerCalculator' },
  ];

  const handleNavigation = (url) => {
    window.location.href = url;
  };

  return (
    <div style={{
      backgroundColor: '#f6f6f7',
      borderBottom: '1px solid #e1e3e5',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      {navItems.map((item, index) => (
        <Button
          key={index}
          variant={item.active ? 'primary' : 'tertiary'}
          size="slim"
          onClick={() => handleNavigation(item.url)}
          icon={item.icon}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
