import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { initializeAnalyticsData } from "../services/analytics.server";
import { syncAllOrders } from "../services/orders.server";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Initialize analytics data if not already initialized
  await initializeAnalyticsData();
  
  try {
    console.log('Starting order sync for shop:', session.shop);
    await syncAllOrders(admin.graphql);
    console.log('Order sync completed successfully');
  } catch (error) {
    console.error('Error syncing orders:', error);
  }
  
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop
  });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/dashboard">Dashboard</Link>
        <Link to="/app/orders">Orders</Link>
        <Link to="/app/cancelOrders">Cancel Orders</Link>
        <Link to="/app/settings">Settings</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
