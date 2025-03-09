import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData, useNavigation } from "@remix-run/react";
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
  Toast,
  Frame,
} from "@shopify/polaris";
import { FilterIcon, ViewIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { getCancelOrders, cancelOrdersInShopify } from "../services/cancelOrders.server";
import { useState, useCallback, useMemo } from "react";

const SHOW_OPTIONS = [
  { label: "10 entries", value: "10" },
  { label: "25 entries", value: "25" },
  { label: "50 entries", value: "50" },
  { label: "100 entries", value: "100" },
];

const TABLE_COLUMNS = [
  { key: "select", title: "Select", type: "text", toggleable: false },
  { key: "orderId", title: "Order ID", type: "text", toggleable: false },
  { key: "email", title: "Email", type: "text", toggleable: true },
  { key: "refund", title: "Refund", type: "text", toggleable: true },
  { key: "reason", title: "Reason", type: "text", toggleable: true },
  { key: "restock", title: "Restock", type: "text", toggleable: true },
];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const orders = await getCancelOrders();
  return json({ orders });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const orderIds = formData.get("orderIds").split(",");
  
  try {
    await cancelOrdersInShopify(request, orderIds);
    return json({ status: "success", message: "Orders cancelled successfully" });
  } catch (error) {
    return json({ status: "error", message: error.message });
  }
};

export default function CancelOrders() {
  const { orders } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();

  // State
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEntries, setShowEntries] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibilityActive, setColumnVisibilityActive] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    email: true,
    refund: true,
    reason: true,
    restock: true,
  });
  const [filterPopoverActive, setFilterPopoverActive] = useState(false);
  const [filters, setFilters] = useState({});
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Data Processing
  const filteredData = useMemo(() => {
    return orders.filter((order) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const orderValue = order[key];
        return orderValue && 
               orderValue.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [orders, filters]);

  // Effects
  useMemo(() => {
    if (actionData?.status) {
      setToastActive(true);
      setToastMessage(actionData.message);
      setToastError(actionData.status === "error");
      if (actionData.status === "success") {
        setSelectedOrders([]);
        setSelectAll(false);
      }
    }
  }, [actionData]);

  // Handlers
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredData.map(order => order.orderId));
    }
    setSelectAll(!selectAll);
  }, [selectAll, filteredData]);

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  }, []);

  const handleCancelOrders = useCallback(() => {
    if (selectedOrders.length === 0) {
      setToastActive(true);
      setToastMessage("Please select at least one order to cancel");
      setToastError(true);
      return;
    }

    if (confirm("Are you sure you want to cancel the selected orders?")) {
      submit(
        { orderIds: selectedOrders.join(",") },
        { method: "post" }
      );
    }
  }, [selectedOrders, submit]);

  const handleColumnVisibilityChange = useCallback((key) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const visibleColumns = useMemo(() => {
    return TABLE_COLUMNS.filter(
      (column) => !column.toggleable || columnVisibility[column.key],
    );
  }, [columnVisibility]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * parseInt(showEntries);
    const endIndex = startIndex + parseInt(showEntries);
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, showEntries]);

  const rows = useMemo(() => {
    return paginatedData.map((order) => [
      <Checkbox
        checked={selectedOrders.includes(order.orderId)}
        onChange={() => handleSelectOrder(order.orderId)}
      />,
      order.orderId,
      ...(columnVisibility.email ? [order.email] : []),
      ...(columnVisibility.refund ? [order.refund ? "Yes" : "No"] : []),
      ...(columnVisibility.reason ? [order.reason] : []),
      ...(columnVisibility.restock ? [order.restock ? "Yes" : "No"] : []),
    ]);
  }, [paginatedData, selectedOrders, columnVisibility, handleSelectOrder]);

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      error={toastError}
      onDismiss={() => setToastActive(false)}
      duration={4500}
    />
  ) : null;

  return (
    <Frame>
      <Page title="Cancel Orders">
        <Layout>
          {/* Controls Section */}
          <Layout.Section>
            <Card>
                <InlineStack align="space-between">
                  <Select
                    label="Show entries"
                    options={SHOW_OPTIONS}
                    value={showEntries}
                    onChange={setShowEntries}
                  />
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
                          {visibleColumns.filter(col => col.key !== 'select').map((column) => (
                            <Box key={column.key}>
                              <TextField
                                label={column.title}
                                value={filters[column.key] || ""}
                                onChange={(value) =>
                                  handleFilterChange(column.key, value)
                                }
                                autoComplete="off"
                              />
                            </Box>
                          ))}
                        </InlineStack>
                      </Box>
                    </Popover>

                    {/* Cancel Orders Button */}
                    <Button
                      primary
                      loading={navigation.state === "submitting"}
                      disabled={selectedOrders.length === 0}
                      onClick={handleCancelOrders}
                    >
                      Cancel Selected Orders
                    </Button>
                  </ButtonGroup>
                </InlineStack>
            </Card>
          </Layout.Section>

          {/* Table Section */}
          <Layout.Section>
            <Card>
              <Box padding="400">
                <InlineStack align="start">
                  <Checkbox
                    label="Select All"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </InlineStack>
                <Box paddingBlockStart="400">
                  <DataTable
                    columnContentTypes={Array(visibleColumns.length).fill("text")}
                    headings={visibleColumns.map((col) => col.title)}
                    rows={rows}
                    hoverable
                    increasedTableDensity
                  />
                </Box>
              </Box>
            </Card>
          </Layout.Section>

          {/* Pagination Section */}
          <Layout.Section>
            <Card>
              <Box padding="400">
                <InlineStack align="space-between">
                  <div>
                    Showing {Math.min(filteredData.length, (currentPage - 1) * parseInt(showEntries) + 1)} to{" "}
                    {Math.min(filteredData.length, currentPage * parseInt(showEntries))} of{" "}
                    {filteredData.length} entries
                  </div>
                  <Pagination
                    label={`Page ${currentPage}`}
                    hasPrevious={currentPage > 1}
                    onPrevious={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    hasNext={
                      currentPage < Math.ceil(filteredData.length / parseInt(showEntries))
                    }
                    onNext={() => setCurrentPage((prev) => prev + 1)}
                  />
                </InlineStack>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
        {toastMarkup}
      </Page>
    </Frame>
  );
}