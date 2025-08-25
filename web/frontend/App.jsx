import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";
import AppNavigation from "./components/Navigation";

import { QueryProvider, PolarisProvider, AppBridgeProvider } from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <AppBridgeProvider>
      <PolarisProvider>
        <BrowserRouter>
          <QueryProvider>
            <AppNavigation />
            <Routes pages={pages} />
          </QueryProvider>
        </BrowserRouter>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
