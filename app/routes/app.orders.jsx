import React, { useState, useCallback, useMemo } from "react";
import {
  Page,
  Card,
  Button,
  Select,
  InlineStack,
  Layout,
  Popover,
  Checkbox,
  Box,
  DataTable,
  ButtonGroup,
  Pagination,
  TextField,
  DatePicker,
  BlockStack,
} from "@shopify/polaris";
import { FilterIcon, ViewIcon, CalendarIcon } from "@shopify/polaris-icons";

// ===============================
// Dummy Data & Constants
// ===============================

/**
 * Sample order data structure
 */
const DUMMY_ORDERS = [
  {
    id: "1",
    orderDate: "2024-03-20T10:30:00Z", // ISO format
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    orderId: "#ORD-001",
    product: "Product A",
    payment: "Paid",
    paymentMethod: "Credit Card",
    tier: "Premium",
    address: "123 Main St, City",
    riskVerification: "Verified",
    tags: "Priority",
    otp: "Verified",
    ivr: "Completed",
    shipmentStatus: "Delivered",
  },
  {
    id: "2",
    orderDate: "03/19/2024", // US format
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1987654321",
    orderId: "#ORD-002",
    product: "Product B",
    payment: "Pending",
    paymentMethod: "PayPal",
    tier: "Standard",
    address: "456 Oak St, Town",
    riskVerification: "Pending",
    tags: "New",
    otp: "Pending",
    ivr: "Pending",
    shipmentStatus: "Processing",
  },
  {
    id: "3",
    orderDate: "03-18-2024", // US format
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1122334455",
    orderId: "#ORD-003",
    product: "Product C",
    payment: "Paid",
    paymentMethod: "Bank Transfer",
    tier: "Premium",
    address: "789 Pine St, Village",
    riskVerification: "Verified",
    tags: "Urgent",
    otp: "Failed",
    ivr: "Failed",
    shipmentStatus: "On Hold",
  },
];

/**
 * Column definitions for the orders table
 * Each column has a key, title, type, and optional configuration
 */
const TABLE_COLUMNS = [
  { key: "name", title: "Name", type: "text", toggleable: true },
  { key: "email", title: "Email", type: "text", toggleable: true },
  { key: "phone", title: "Phone", type: "text", toggleable: true },
  { key: "orderId", title: "Order ID", type: "text" },
  { key: "product", title: "Product", type: "text" },
  {
    key: "payment",
    title: "Paid/Pending",
    type: "select",
    options: ["Paid", "Pending"],
  },
  {
    key: "paymentMethod",
    title: "Payment Method",
    type: "select",
    options: ["Credit Card", "PayPal", "Bank Transfer"],
  },
  {
    key: "tier",
    title: "Tier",
    type: "select",
    options: ["Premium", "Standard"],
  },
  { key: "address", title: "Address", type: "text" },
  {
    key: "riskVerification",
    title: "Risk Verification",
    type: "select",
    options: ["Verified", "Pending"],
  },
  {
    key: "tags",
    title: "Tags",
    type: "select",
    options: ["Priority", "New", "Urgent"],
  },
  {
    key: "otp",
    title: "OTP",
    type: "select",
    options: ["Verified", "Pending", "Failed"],
  },
  {
    key: "ivr",
    title: "IVR",
    type: "select",
    options: ["Completed", "Pending", "Failed"],
  },
  {
    key: "shipmentStatus",
    title: "Shipment Status",
    type: "select",
    options: ["Delivered", "Processing", "On Hold"],
  },
];

/**
 * Options for the "Show entries" dropdown
 */
const SHOW_OPTIONS = [
  { label: "50 entries", value: "50" },
  { label: "100 entries", value: "100" },
  { label: "500 entries", value: "500" },
  { label: "1000 entries", value: "1000" },
];

// ===============================
// Main Component
// ===============================

const OrdersPage = () => {
  // ===============================
  // State Management
  // ===============================

  // Filter and visibility states
  const [filterPopoverActive, setFilterPopoverActive] = useState(false);
  const [columnVisibilityActive, setColumnVisibilityActive] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    email: true,
    phone: true,
  });
  const [filters, setFilters] = useState({});

  // Pagination state
  const [showEntries, setShowEntries] = useState("50");
  const [currentPage, setCurrentPage] = useState(1);

  // Date picker state
  const [datePopoverActive, setDatePopoverActive] = useState(false);
  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(),
  });

  // ===============================
  // Handlers
  // ===============================

  /**
   * Handles column visibility toggle
   */
  const handleColumnVisibilityChange = (key) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Handles filter changes
   */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Handles date range change
   */
  const handleDateRangeChange = ({ start, end }) => {
    setSelectedDates({ start, end });
    // Add your logic here to filter orders based on date range
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDates({ start: today, end: today });
    setDatePopoverActive(false);
  };

  // ===============================
  // Data Processing
  // ===============================

  // Add date parsing utility
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Handle different date formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  /**
   * Filter data based on filters
   */
  const filteredData = useMemo(() => {
    return DUMMY_ORDERS.filter((order) => {
      // Date range filter
      if (selectedDates.start && selectedDates.end) {
        const orderDate = parseDate(order.orderDate);
        if (!orderDate) return false;
        
        const start = new Date(selectedDates.start);
        const end = new Date(selectedDates.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        if (orderDate < start || orderDate > end) {
          return false;
        }
      }

      // Existing filters
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const orderValue = order[key];
        return (
          orderValue &&
          orderValue.toString().toLowerCase().includes(value.toLowerCase())
        );
      });
    });
  }, [filters, selectedDates]);

  /**
   * Get visible columns based on visibility settings
   */
  const visibleColumns = useMemo(() => {
    return TABLE_COLUMNS.filter(
      (column) => !column.toggleable || columnVisibility[column.key],
    );
  }, [columnVisibility]);

  /**
   * Convert filtered data to table rows
   */
  const rows = useMemo(() => {
    return filteredData.map((order) =>
      visibleColumns.map((column) => order[column.key] || "--"),
    );
  }, [filteredData, visibleColumns]);

  // ===============================
  // Render
  // ===============================

  return (
    <Page title="Orders">
      <Layout>
        {/* Controls Section */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <InlineStack align="space-between" wrap={false}>
                <InlineStack gap="200">
                  {/* Date Range Picker */}
                  <Popover
                    active={datePopoverActive}
                    activator={
                      <Button
                        icon={CalendarIcon}
                        onClick={() => setDatePopoverActive(!datePopoverActive)}
                      >
                        {selectedDates.start && selectedDates.end
                          ? `${formatDate(selectedDates.start)} - ${formatDate(selectedDates.end)}`
                          : "Select Date Range"}
                      </Button>
                    }
                    onClose={() => setDatePopoverActive(false)}
                  >
                    <Box padding="400">
                      <BlockStack gap="400">
                        <DatePicker
                          month={month}
                          year={year}
                          onChange={handleDateRangeChange}
                          onMonthChange={(month, year) =>
                            setDate({ month, year })
                          }
                          selected={selectedDates}
                          allowRange
                        />
                      </BlockStack>
                    </Box>
                  </Popover>

                  {/* Today Button */}
                  <Button onClick={handleTodayClick}>Today</Button>
                </InlineStack>

                <InlineStack>
                  <ButtonGroup>
                    {/* Column Visibility */}
                    <Popover
                      active={columnVisibilityActive}
                      activator={
                        <Button
                          icon={ViewIcon}
                          onClick={() =>
                            setColumnVisibilityActive(!columnVisibilityActive)
                          }
                        >
                          Show/Hide
                        </Button>
                      }
                      onClose={() => setColumnVisibilityActive(false)}
                    >
                      <Box padding="400">
                        <InlineStack vertical gap="200">
                          {TABLE_COLUMNS.filter((col) => col.toggleable).map(
                            (column) => (
                              <Checkbox
                                key={column.key}
                                label={column.title}
                                checked={columnVisibility[column.key]}
                                onChange={() =>
                                  handleColumnVisibilityChange(column.key)
                                }
                              />
                            ),
                          )}
                        </InlineStack>
                      </Box>
                    </Popover>

                    {/* Filters */}
                    <Popover
                      active={filterPopoverActive}
                      activator={
                        <Button
                          icon={FilterIcon}
                          onClick={() =>
                            setFilterPopoverActive(!filterPopoverActive)
                          }
                        >
                          Filters
                        </Button>
                      }
                      onClose={() => setFilterPopoverActive(false)}
                    >
                      <Box padding="400" width="400px">
                        <InlineStack vertical gap="400">
                          {visibleColumns.map((column) => (
                            <Box key={column.key}>
                              {column.type === "text" ? (
                                <TextField
                                  label={column.title}
                                  value={filters[column.key] || ""}
                                  onChange={(value) =>
                                    handleFilterChange(column.key, value)
                                  }
                                  autoComplete="off"
                                />
                              ) : (
                                <Select
                                  label={column.title}
                                  options={[
                                    { label: "All", value: "" },
                                    ...column.options.map((opt) => ({
                                      label: opt,
                                      value: opt,
                                    })),
                                  ]}
                                  value={filters[column.key] || ""}
                                  onChange={(value) =>
                                    handleFilterChange(column.key, value)
                                  }
                                />
                              )}
                            </Box>
                          ))}
                        </InlineStack>
                      </Box>
                    </Popover>
                  </ButtonGroup>
                </InlineStack>
              </InlineStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Table Section */}
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={Array(visibleColumns.length).fill("text")}
              headings={visibleColumns.map((col) => col.title)}
              rows={
                rows.length > 0
                  ? rows
                  : [[...Array(visibleColumns.length)].map(() => "--")]
              }
              hoverable
              verticalAlign="middle"
              increasedTableDensity
            />
          </Card>
        </Layout.Section>

        {/* Pagination Section */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <InlineStack align="space-between">
                <Select
                  label="Show entries"
                  options={SHOW_OPTIONS}
                  value={showEntries}
                  onChange={setShowEntries}
                />
                <Pagination
                  label={`Page ${currentPage}`}
                  hasPrevious={currentPage > 1}
                  onPrevious={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  hasNext={
                    currentPage < Math.ceil(rows.length / parseInt(showEntries))
                  }
                  onNext={() => setCurrentPage((prev) => prev + 1)}
                />
              </InlineStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default OrdersPage;
