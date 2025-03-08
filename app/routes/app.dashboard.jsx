import React, { useState } from "react";
import { Page, Card, Layout, Text, Banner } from "@shopify/polaris";
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
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAnalytics } from "../services/analytics.server";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export const loader = async () => json(await getAnalytics());

const SectionTitle = ({ children }) => (
  <div style={styles.sectionTitleContainer}>
    <div style={styles.sectionTitleLine} />
    <div style={styles.sectionTitleText}>
      <Text variant="headingSm" as="h4">{children}</Text>
    </div>
  </div>
);

const MetricCard = ({ title, value }) => (
  <div style={styles.metricCardContainer}>
    <Card title={title} sectioned>
      <Text variant="bodyXl">{title}</Text>
      <Text variant="headingXl">{value}</Text>
    </Card>
  </div>
);

const DataTable = ({ headers, rows }) => (
  <Card sectioned>
    <table style={styles.table}>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i} style={styles.th}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={styles.td}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const Dashboard = () => {
  const data = useLoaderData();
  const [showBanner, setShowBanner] = useState(true);

  const chartData = {
    labels: data.profitCurve.orderPoints,
    datasets: [{
      label: "Profit Curve (₹)",
      data: data.profitCurve.profitValues,
      borderColor: "#0073e6",
      backgroundColor: "rgba(0, 115, 230, 0.5)",
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        type: "linear",
        beginAtZero: true,
        title: { display: true, text: "Profit (₹)" },
      },
      x: {
        type: "linear",
        beginAtZero: true,
        title: { display: true, text: "Number of Orders" },
      },
    },
    plugins: {
      annotation: {
        annotations: {
          optimalZone: {
            type: "line",
            yMin: 0,
            yMax: data.profitCurve.optimalZone.maxProfit,
            xMin: data.profitCurve.optimalZone.maxOrder,
            xMax: data.profitCurve.optimalZone.maxOrder,
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            label: {
              display: false,
              content: "Cut-off Point",
              position: "top",
            },
          },
        },
      },
    },
  };

  const metrics = [
    { title: "Cut-off Quality", value: `${data.metrics.cutOffQuality}%` },
    { title: "Total Orders", value: data.metrics.totalOrders },
    { title: "Flagged", value: data.metrics.flaggedOrders },
    { title: "Orders to Ship", value: data.metrics.ordersToShip },
    { title: "TrackScore Delivery %", value: `${data.metrics.tracksureDelivery}%` },
  ];

  const performanceHeaders = ["", "All shipping", "Trackscore delivery"];
  const performanceRows = [
    ["Total Orders", data.performanceMetrics.allShipping.totalOrders, data.performanceMetrics.trackscore.totalOrders],
    ["Delivery %", `${data.performanceMetrics.allShipping.deliveryPercentage}%`, `${data.performanceMetrics.trackscore.deliveryPercentage}%`],
    ["Undelivered Orders", data.performanceMetrics.allShipping.undeliveredOrders, data.performanceMetrics.trackscore.undeliveredOrders],
  ];

  const costsRows = [
    ["Revenue (+) [Delievred orders]", `₹ ${data.costs.allShipping.revenue}`, `₹ ${data.costs.trackscore.revenue}`],
    ["Product Costs (-)", `₹ ${data.costs.allShipping.productCosts}`, `₹ ${data.costs.trackscore.productCosts}`],
    ["Ad Costs (-)", `₹ ${data.costs.allShipping.adCosts}`, `₹ ${data.costs.trackscore.adCosts}`],
    ["Shipping Costs (-)", `₹ ${data.costs.allShipping.shippingCosts}`, `₹ ${data.costs.trackscore.shippingCosts}`],
    ["Packing Costs (-) [RTO Loss]", `₹ ${data.costs.allShipping.packingCosts}`, `₹ ${data.costs.trackscore.packingCosts}`],
  ];

  const summaryRows = [
    ["Net profit (Σ)", `₹ ${data.summary.allShipping.netProfit}`, `₹ ${data.summary.trackscore.netProfit}`],
    ["Inventry saved", `₹ ${data.summary.allShipping.inventrySaved}`, `₹ ${data.summary.trackscore.inventrySaved}`],
    ["Capital used", `₹ ${data.summary.allShipping.capitalUsed}`, `₹ ${data.summary.trackscore.capitalUsed}`],
    ["Capital saved", `₹ ${data.summary.allShipping.capitalSaved}`, `₹ ${data.summary.trackscore.capitalSaved}`],
    ["Capital efficiency", `₹ ${data.summary.allShipping.capitalEfficiency}`, `₹ ${data.summary.trackscore.capitalEfficiency}`],
    ["Total savings", `₹ ${data.summary.allShipping.totalSavings}`, `₹ ${data.summary.trackscore.totalSavings}`],
  ];

  return (
    <Page title="Dashboard">
      <Layout>
        {showBanner && (
          <Layout.Section>
            <Banner
              tone="warning"
              title={`Let the orders reach ${data.profitCurve.optimalZone.maxOrder} of daily orders`}
              onDismiss={() => setShowBanner(false)}
            />
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <Line data={chartData} options={chartOptions} />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div style={styles.metricsContainer}>
            {metrics.map((metric, i) => (
              <MetricCard key={i} {...metric} />
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <SectionTitle>Performance metrics</SectionTitle>
          <DataTable headers={performanceHeaders} rows={performanceRows} />
        </Layout.Section>

        <Layout.Section>
          <SectionTitle>Costs</SectionTitle>
          <DataTable headers={performanceHeaders} rows={costsRows} />
        </Layout.Section>

        <Layout.Section>
          <SectionTitle>Summary</SectionTitle>
          <DataTable headers={performanceHeaders} rows={summaryRows} />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  th: { textAlign: "left" },
  td: { textAlign: "left" },
  metricsContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  metricCardContainer: {
    width: "100%",
    textAlign: "center",
  },
  sectionTitleContainer: {
    position: "relative",
    textAlign: "center",
    margin: "0 0 12px 0",
    zIndex: "1",
  },
  sectionTitleLine: {
    height: "1px",
    width: "100%",
    border: "1px dashed #ccc",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: "-1",
  },
  sectionTitleText: {
    background: "white",
    width: "fit-content",
    padding: "4px 12px",
    borderRadius: "4px",
    boxShadow: "var(--p-shadow-button)",
    zIndex: "1",
    margin: "0 auto",
  },
};

export default Dashboard;
