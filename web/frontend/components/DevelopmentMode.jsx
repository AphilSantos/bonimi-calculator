import React from 'react';
import { LegacyCard, Text, VerticalStack, Button } from '@shopify/polaris';

export default function DevelopmentMode() {
  const isInShopifyFrame = window.self !== window.top || 
                          window.location.hostname.includes('shopify.com') ||
                          window.location.hostname.includes('trycloudflare.com') ||
                          window.location.hostname.includes('ngrok.io');

  if (isInShopifyFrame) {
    return null; // Don't show anything if we're in the right context
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <LegacyCard sectioned>
        <VerticalStack gap="3">
          <Text variant="headingMd" fontWeight="semibold" color="warning">
            Development Mode
          </Text>
          <Text variant="bodyMd" color="subdued">
            This app is running in development mode outside of Shopify's admin context.
          </Text>
          <Text variant="bodySm" color="subdued">
            Some features may not work properly. To test the full app, use the Shopify CLI development server.
          </Text>
          <Button 
            size="slim" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </VerticalStack>
      </LegacyCard>
    </div>
  );
}
