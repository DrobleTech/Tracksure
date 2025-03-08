import React, { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  TextField,
  Checkbox,
  Select,
  Button,
  Layout,
  InlineStack,
  BlockStack,
  DropZone,
  Text,
  Spinner,
} from "@shopify/polaris";
import { getSettings, updateOTPEnabled } from "../services/settings.server";

/**
 * Mock API response structure
 * This structure should match your actual API response
 */
const DUMMY_API_RESPONSE = {
  products: [
    {
      id: 1,
      name: "Product 1",
      price: "299.99",
      mrp: "349.99",
      shipping: "15",
      cpp: "200",
      packing: "10"
    },
    {
      id: 2,
      name: "Product 2",
      price: "199.99",
      mrp: "249.99",
      shipping: "12",
      cpp: "150",
      packing: "8"
    }
  ],
  delivery: {
    currentPastDPercentage: "80%",
  },
  settings: {
    otp: {
      isEnabled: true,
    },
    bulkUpload: {
      allowedFormats: [".csv", ".xlsx"],
    }
  }
};

// Styled components
const Container = ({ children, width }) => (
  <div style={{
    width: width || "100%",
    border: "1px dashed #ccc",
    padding: "10px",
    borderRadius: "4px",
    height: "100%"
  }}>
    {children}
  </div>
);

// Table styles
const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f4f4f4",
    padding: "8px",
    textAlign: "left"
  },
  td: {
    padding: "4px",
  },
};

// Action function to handle form submissions
export async function action({ request }) {
  const formData = await request.formData();
  const enabled = formData.get("otpEnabled") === "true";
  
  await updateOTPEnabled(enabled);
  return json({ success: true });
}

// Loader function to get initial data
export async function loader() {
  const settings = await getSettings();
  return json({
    settings,
    products: DUMMY_API_RESPONSE.products,
    delivery: DUMMY_API_RESPONSE.delivery,
  });
}

/**
 * Settings Page Component
 * Handles product pricing, delivery settings, and OTP configuration
 */
const SettingsPage = () => {
  const submit = useSubmit();
  const { settings, products: initialProducts, delivery: initialDelivery } = useLoaderData();

  // API related states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [products, setProducts] = useState(initialProducts);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [otpEnabled, setOtpEnabled] = useState(settings.otpEnabled);
  const [otpReceived, setOtpReceived] = useState("yes");
  const [files, setFiles] = useState([]);

  // Constants
  const otpOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  /**
   * Handlers
   */
  const handleDropZoneDrop = (_, acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const handleProductChange = (value, id, field) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const handleOTPChange = (checked) => {
    setOtpEnabled(checked);
    submit(
      { otpEnabled: checked.toString() },
      { method: "post" }
    );
  };

  /**
   * Loading and Error states
   */
  if (isLoading) {
    return (
      <Page title="Settings">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner accessibilityLabel="Loading settings" size="large" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Settings">
        <div style={{ color: 'red', padding: '20px' }}>{error}</div>
      </Page>
    );
  }

  /**
   * Render Methods
   */
  const renderProductTable = () => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Product</th>
          <th style={styles.th}>Price</th>
          <th style={styles.th}>MRP</th>
          <th style={styles.th}>Shipping</th>
          <th style={styles.th}>CPP</th>
          <th style={styles.th}>Packing</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td style={{...styles.td, whiteSpace: "nowrap"}}>{product.name}</td>
            {['price', 'mrp', 'shipping', 'cpp', 'packing'].map((field) => (
              <td key={field} style={styles.td}>
                <TextField
                  size="slim"
                  value={product[field]}
                  type="number"
                  onChange={(value) => handleProductChange(value, product.id, field)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDeliveryStats = () => (
    <InlineStack align="space-between">
      <Text variant="headingXl" as="h2">
        Current past D%
      </Text>
      <div style={{width: "1px", border: "1px dashed #ccc", display: "block !important" }}></div>
      <Text variant="headingXl" as="h2">
        {delivery.currentPastDPercentage}
      </Text>
    </InlineStack>
  );

  const renderOTPSettings = () => (
    <BlockStack gap="200">
      <InlineStack>
        <Checkbox
          label="Enable OTP"
          checked={otpEnabled}
          onChange={handleOTPChange}
        />
      </InlineStack>
      {otpEnabled && (
        <BlockStack gap="200">
          <Select
            label="OTP Received"
            options={otpOptions}
            onChange={setOtpReceived}
            value={otpReceived}
          />
        </BlockStack>
      )}
    </BlockStack>
  );

  const renderBulkUpload = () => (
    <BlockStack gap="200">
      <Text>Bulk Upload</Text>
      <DropZone onDrop={handleDropZoneDrop}>
        <DropZone.FileUpload actionTitle="Add file" />
      </DropZone>
      <Text variant="bodySm" color="subdued">
        Accepted formats: {settings?.bulkUpload?.allowedFormats.join(", ")}
      </Text>
    </BlockStack>
  );

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <InlineStack wrap={false} gap="400">
            <Container>
              {renderProductTable()}
            </Container>
            <Container width="100%">
              {renderDeliveryStats()}
            </Container>
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <InlineStack wrap={false} gap="400">
            <Container>
              {renderOTPSettings()}
            </Container>
            <Container>
              {renderBulkUpload()}
            </Container>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default SettingsPage;
