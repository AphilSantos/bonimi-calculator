import { useState } from "react";
import { LegacyCard, TextContainer, Text, Toast } from "@shopify/polaris";
import { useAppBridgeContext } from "./providers/AppBridgeProvider";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";

export function ProductsCard() {
  const app = useAppBridgeContext();
  const { t } = useTranslation();
  const [isPopulating, setIsPopulating] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const productsCount = 5;

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
  } = useQuery({
    queryKey: ["productCount"],
    queryFn: async () => {
      // Use standard fetch to backend API endpoint
      const response = await fetch("/api/products/count");
      return await response.json();
    },
    refetchOnWindowFocus: false,
  });

  const setPopulating = (flag) => {
    setIsPopulating(flag);
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  };

  const handlePopulate = async () => {
    setPopulating(true);
    
    try {
      // Use standard fetch to backend API endpoint
      const response = await fetch("/api/products", { 
        method: "POST" 
      });

      if (response.ok) {
        await refetchProductCount();
        showToast(t("ProductsCard.productsCreatedToast", { count: productsCount }));
      } else {
        showToast(t("ProductsCard.errorCreatingProductsToast"), true);
      }
    } catch (error) {
      console.error("Error creating products:", error);
      showToast(t("ProductsCard.errorCreatingProductsToast"), true);
    }

    setPopulating(false);
  };

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      error={toastError}
      onDismiss={() => setToastActive(false)}
    />
  ) : null;

  return (
    <>
      <LegacyCard
        title={t("ProductsCard.title")}
        sectioned
        primaryFooterAction={{
          content: t("ProductsCard.populateProductsButton", {
            count: productsCount,
          }),
          onAction: handlePopulate,
          loading: isPopulating,
        }}
      >
        <TextContainer spacing="loose">
          <p>{t("ProductsCard.description")}</p>
          <Text as="h4" variant="headingMd">
            {t("ProductsCard.totalProductsHeading")}
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              {isLoadingCount ? "-" : data?.count}
            </Text>
          </Text>
        </TextContainer>
      </LegacyCard>
      {toastMarkup}
    </>
  );
}
