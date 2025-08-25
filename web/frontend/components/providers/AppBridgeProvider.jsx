import { createContext, useContext, useEffect, useState } from "react";
import { createApp } from "@shopify/app-bridge";

const AppBridgeContext = createContext(null);

export function useAppBridgeContext() {
  const context = useContext(AppBridgeContext);
  if (!context) {
    throw new Error("useAppBridgeContext must be used within an AppBridgeProvider");
  }
  return context;
}

export function AppBridgeProvider({ children }) {
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get the API key from the meta tag
      const apiKey = document.querySelector('meta[name="shopify-api-key"]')?.getAttribute('content');
      
      // Get the shop origin from the URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const shop = urlParams.get('shop');
      const host = urlParams.get('host');

      // Check if we're in a Shopify iframe context
      const isInShopifyFrame = window.self !== window.top || 
                              window.location.hostname.includes('shopify.com') ||
                              window.location.hostname.includes('trycloudflare.com') ||
                              window.location.hostname.includes('ngrok.io');

      // For local development, use fallback values if Shopify context is not available
      if (apiKey && apiKey !== '%VITE_SHOPIFY_API_KEY%' && (host || shop) && isInShopifyFrame) {
        // Create the app bridge instance
        const appBridgeApp = createApp({
          apiKey: apiKey,
          host: host || shop,
          forceRedirect: false
        });
        
        setApp(appBridgeApp);
        console.log('App Bridge initialized successfully');
      } else {
        // Create a mock app for local development
        console.log('Running in local development mode - using mock App Bridge');
        const mockApp = {
          // Mock methods that might be used
          loading: () => {},
          dispatch: () => {},
          getState: () => ({}),
          subscribe: () => () => {},
          // Add other methods as needed
          toast: {
            show: (content, options = {}) => {
              console.log('Mock toast:', content, options);
              // You could implement a simple toast notification here
            }
          },
          // Mock authenticatedFetch
          authenticatedFetch: async (url, options = {}) => {
            console.log('Mock authenticatedFetch:', url, options);
            // For local development, just use regular fetch
            return fetch(url, options);
          }
        };
        setApp(mockApp);
      }
    } catch (error) {
      console.error('Error initializing App Bridge:', error);
      // Create a mock app as fallback
      const mockApp = {
        loading: () => {},
        dispatch: () => {},
        getState: () => ({}),
        subscribe: () => () => {},
        toast: {
          show: (content, options = {}) => {
            console.log('Mock toast:', content, options);
          }
        },
        authenticatedFetch: async (url, options = {}) => {
          console.log('Mock authenticatedFetch:', url, options);
          return fetch(url, options);
        }
      };
      setApp(mockApp);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading App Bridge...</div>;
  }

  return (
    <AppBridgeContext.Provider value={app}>
      {children}
    </AppBridgeContext.Provider>
  );
}
