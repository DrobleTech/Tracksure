import { authenticate } from "../shopify.server";
import { upsertOrder } from "../services/orders.server";

export const action = async ({ request }) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  console.log('Received webhook:', {
    topic,
    shop,
    orderId: payload.id
  });

  try {
    switch (topic) {
      case "ORDERS_CREATE":
        console.log('Processing new order:', payload.id);
        await upsertOrder(payload);
        console.log('Successfully processed new order:', payload.id);
        break;
        
      case "ORDERS_UPDATED":
        console.log('Processing order update:', payload.id);
        await upsertOrder(payload);
        console.log('Successfully processed order update:', payload.id);
        break;
        
      case "ORDERS_CANCELLED":
        console.log('Processing order cancellation:', payload.id);
        await upsertOrder(payload);
        console.log('Successfully processed order cancellation:', payload.id);
        break;
        
      case "APP_UNINSTALLED":
        console.log('App uninstalled from shop:', shop);
        // Clean up shop data if needed
        break;

      default:
        console.log('Unhandled webhook topic:', topic);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', {
      topic,
      shop,
      orderId: payload.id,
      error: error.message
    });
    return new Response(null, { status: 500 });
  }
}; 