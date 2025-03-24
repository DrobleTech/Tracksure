import { ActionFunction, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { cancelOrders } from "../services/cancelOrders.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const orderId = formData.get("orderId") as string;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    await cancelOrders(request, [orderId]);

    return json({ success: true });
  } catch (error) {
    return json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to cancel order" 
      },
      { status: 400 }
    );
  }
};