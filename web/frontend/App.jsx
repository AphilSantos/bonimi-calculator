import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";
import AppNavigation from "./components/Navigation";
import DevelopmentMode from "./components/DevelopmentMode";

import { QueryProvider, PolarisProvider, AppBridgeProvider } from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Check if we're in a Shopify iframe context
  const isInShopifyFrame = window.self !== window.top || 
                          window.location.hostname.includes('shopify.com') ||
                          window.location.hostname.includes('trycloudflare.com') ||
                          window.location.hostname.includes('ngrok.io');

  // Show development mode warning if not in Shopify context
  if (isDevelopment && !isInShopifyFrame) {
    console.log('Running in development mode outside Shopify context');
  }

  return (
    <AppBridgeProvider>
      <PolarisProvider>
        <BrowserRouter>
          <QueryProvider>
            <DevelopmentMode />
            <AppNavigation />
            <Routes pages={pages} />
          </QueryProvider>
        </BrowserRouter>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
