import React, { useState, useEffect } from "react";
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

/**
 * Settings Page Component
 * Handles product pricing, delivery settings, and OTP configuration
 */
const SettingsPage = () => {
  // API related states
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [products, setProducts] = useState([]);
  const [delivery, setDelivery] = useState({});
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [otpReceived, setOtpReceived] = useState("yes");
  const [files, setFiles] = useState([]);

  // Constants
  const otpOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  /**
   * Fetch settings data from API
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('your-api-endpoint');
        // const result = await response.json();
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = DUMMY_API_RESPONSE;

        // Update state with API data
        setData(result);
        setProducts(result.products);
        setDelivery(result.delivery);
        setOtpEnabled(result.settings.otp.isEnabled);
      } catch (err) {
        setError('Failed to load settings data');
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleSubmit = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('your-api-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     products,
      //     delivery,
      //     settings: { otp: { isEnabled: otpEnabled } }
      //   })
      // });
      
      console.log('Settings saved:', { products, delivery, otpEnabled });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
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
          onChange={setOtpEnabled}
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
          <InlineStack gap="200">
            <Button onClick={handleSubmit} primary>Save Changes</Button>
            <Button onClick={() => window.location.reload()}>Reset</Button>
          </InlineStack>
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
        Accepted formats: {data?.settings.bulkUpload.allowedFormats.join(", ")}
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
