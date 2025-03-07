import React from "react";
import {
  Page,
  Card,
  Button,
  InlineStack,
  Layout,
  Text,
  Badge,
} from "@shopify/polaris";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

// Dummy API response data structure
const API_RESPONSE_DATA = {
  profitCurve: {
    orderPoints: [0, 20, 40, 60, 80, 100, 120, 140, 154],
    profitValues: [0, 1000, 2800, 4500, 6800, 8200, 9100, 8800, 7500],
    optimalZone: {
      maxOrder: 120,
      maxProfit: 9100,
    },
  },
  metrics: {
    cutOffQuality: 75,
    totalOrders: 156,
    flaggedOrders: 36,
    ordersToShip: 120,
    tracksureDelivery: 78,
  },
  performanceMetrics: {
    allShipping: {
      totalOrders: 156,
      deliveryPercentage: 55,
      undeliveredOrders: 36,
    },
    trackscore: {
      totalOrders: 120,
      deliveryPercentage: 78,
      undeliveredOrders: 10,
    },
  },
  costs: {
    allShipping: {
      revenue: 3200,
      productCosts: 10000,
      adCosts: 8000,
      shippingCosts: 5500,
      packingCosts: 1020,
    },
    trackscore: {
      revenue: 3100,
      productCosts: 8400,
      adCosts: 8000,
      shippingCosts: 4620,
      packingCosts: 660,
    },
  },
  summary: {
    allShipping: {
      netProfit: 7480,
      inventrySaved: 0,
      capitalUsed: 24520,
      capitalSaved: 0,
      capitalEfficiency: 0,
      totalSavings: 0,
    },
    trackscore: {
      netProfit: 9320,
      inventrySaved: 8,
      capitalUsed: 21680,
      capitalSaved: 2840,
      capitalEfficiency: 0,
      totalSavings: 4680,
    },
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

const Dashboard = () => {
  // Transform API data into Chart.js format
  const chartData = {
    labels: API_RESPONSE_DATA.profitCurve.orderPoints,
    datasets: [
      {
        label: "Profit Curve (₹)",
        data: API_RESPONSE_DATA.profitCurve.profitValues,
        borderColor: "#0073e6",
        backgroundColor: "rgba(0, 115, 230, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        type: "linear",
        beginAtZero: true,
        title: {
          display: true,
          text: "Profit (₹)",
        },
      },
      x: {
        type: "linear",
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Orders",
        },
      },
    },
    plugins: {
      annotation: {
        annotations: {
          optimalZone: {
            type: "line",
            yMin: 0,
            yMax: API_RESPONSE_DATA.profitCurve.optimalZone.maxProfit,
            xMin: API_RESPONSE_DATA.profitCurve.optimalZone.maxOrder,
            xMax: API_RESPONSE_DATA.profitCurve.optimalZone.maxOrder,
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            label: {
              display: true,
              content: "Cut-off Point",
              position: "top",
            },
          },
        },
      },
    },
  };

  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <Line data={chartData} options={chartOptions} />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <InlineStack wrap={false} align="center" gap={100}>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Card title="Cut-off Quality" sectioned>
                <Text variant="bodyXl">Cut-off Quality</Text>
                <Text variant="headingXl">{API_RESPONSE_DATA.metrics.cutOffQuality}%</Text>
              </Card>
            </div>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Card title="Total Orders" sectioned>
                <Text variant="bodyXl">Total Orders</Text>
                <Text variant="headingXl">{API_RESPONSE_DATA.metrics.totalOrders}</Text>
              </Card>
            </div>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Card title="Flagged" sectioned>
                <Text variant="bodyXl">Flagged</Text>
                <Text variant="headingXl">{API_RESPONSE_DATA.metrics.flaggedOrders}</Text>
              </Card>
            </div>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Card title="Orders to Ship" sectioned>
                <Text variant="bodyXl">Orders to Ship</Text>
                <Text variant="headingXl">{API_RESPONSE_DATA.metrics.ordersToShip}</Text>
              </Card>
            </div>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Card title="TrackScore Delivery %" sectioned>
                <Text variant="bodyXl">TrackScore Delivery</Text>
                <Text variant="headingXl">{API_RESPONSE_DATA.metrics.tracksureDelivery}%</Text>
              </Card>
            </div>
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <div
            style={{
              position: "relative",
              textAlign: "center",
              margin: " 0 0 12px 0",
              zIndex: "1",
            }}
          >
            <div
              style={{
                height: "1px",
                width: "100%",
                border: "1px dashed #ccc",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: "-1",
              }}
            >
              {" "}
            </div>
            <div
              style={{
                background: "white",
                width: "fit-content",
                padding: "4px 12px",
                borderRadius: "4px",
                boxShadow: "var(--p-shadow-button)",
                zIndex: "1",
                margin: "0 auto",
              }}
            >
              <Text variant="headingSm" as="h4">
                Performance metrics
              </Text>
            </div>
          </div>
          <Card sectioned>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}></th>
                  <th style={styles.th}>All shipping</th>
                  <th style={styles.th}>Trackscore delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Total Orders</td>
                  <td style={styles.td}>
                    {
                      API_RESPONSE_DATA.performanceMetrics.allShipping
                        .totalOrders
                    }
                  </td>
                  <td style={styles.td}>
                    {
                      API_RESPONSE_DATA.performanceMetrics.trackscore
                        .totalOrders
                    }
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Delivery %</td>
                  <td style={styles.td}>
                    {
                      API_RESPONSE_DATA.performanceMetrics.allShipping
                        .deliveryPercentage
                    }
                    %
                  </td>
                  <td style={styles.td}>
                    {
                      API_RESPONSE_DATA.performanceMetrics.trackscore
                        .deliveryPercentage
                    }
                    %
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Undelivered Orders</td>
                  <td style={styles.td}>
                    {
                      API_RESPONSE_DATA.performanceMetrics.allShipping
                        .undeliveredOrders
                    }
                  </td>
                  <td style={styles.td}>
                    {
                      API_RESPONSE_DATA.performanceMetrics.trackscore
                        .undeliveredOrders
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div
            style={{
              position: "relative",
              textAlign: "center",
              margin: " 0 0 12px 0",
              zIndex: "1",
            }}
          >
            <div
              style={{
                height: "1px",
                width: "100%",
                border: "1px dashed #ccc",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: "-1",
              }}
            ></div>
            <div
              style={{
                background: "white",
                width: "fit-content",
                padding: "4px 12px",
                borderRadius: "4px",
                boxShadow: "var(--p-shadow-button)",
                zIndex: "1",
                margin: "0 auto",
              }}
            >
              <Text variant="headingSm" as="h4">
                Costs
              </Text>
            </div>
          </div>
          <Card sectioned>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}></th>
                  <th style={styles.th}>All shipping</th>
                  <th style={styles.th}>Trackscore delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Revenue (+) [Delievred orders]</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.allShipping.revenue}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.trackscore.revenue}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Product Costs (-)</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.allShipping.productCosts}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.trackscore.productCosts}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Ad Costs (-)</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.allShipping.adCosts}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.trackscore.adCosts}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Shipping Costs (-)</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.allShipping.shippingCosts}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.trackscore.shippingCosts}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Packing Costs (-) [RTO Loss]</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.allShipping.packingCosts}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.costs.trackscore.packingCosts}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div
            style={{
              position: "relative",
              textAlign: "center",
              margin: " 0 0 12px 0",
              zIndex: "1",
            }}
          >
            <div
              style={{
                height: "1px",
                width: "100%",
                border: "1px dashed #ccc",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: "-1",
              }}
            ></div>
            <div
              style={{
                background: "white",
                width: "fit-content",
                padding: "4px 12px",
                borderRadius: "4px",
                boxShadow: "var(--p-shadow-button)",
                zIndex: "1",
                margin: "0 auto",
              }}
            >
              <Text variant="headingSm" as="h4">
                Summary
              </Text>
            </div>
          </div>
          <Card sectioned>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}></th>
                  <th style={styles.th}>All shipping</th>
                  <th style={styles.th}>Trackscore delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Net profit (Σ)</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.allShipping.netProfit}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.trackscore.netProfit}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Inventry saved</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.allShipping.inventrySaved}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.trackscore.inventrySaved}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Capital used</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.allShipping.capitalUsed}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.trackscore.capitalUsed}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Capital saved</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.allShipping.capitalSaved}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.trackscore.capitalSaved}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Capital efficiency</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.allShipping.capitalEfficiency}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.trackscore.capitalEfficiency}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Total savings</td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.allShipping.totalSavings}
                  </td>
                  <td style={styles.td}>
                    ₹ {API_RESPONSE_DATA.summary.trackscore.totalSavings}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  th: {
    textAlign: "left",
  },
  td: {
    textAlign: "left",
  },
};

export default Dashboard;
