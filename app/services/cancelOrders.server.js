import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";

const prisma = new PrismaClient();

export async function getCancelOrders() {
  return await prisma.cancelOrder.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function cancelOrdersInShopify(request, orderIds) {
  const { admin } = await authenticate.admin(request);
  
  const cancelPromises = orderIds.map(async (orderId) => {
    const cancelOrder = await prisma.cancelOrder.findUnique({
      where: { orderId }
    });

    if (!cancelOrder) return null;

    const mutation = `
      mutation cancelOrder(
        $orderId: ID!,
        $reason: OrderCancelReason!,
        $refund: Boolean!,
        $restock: Boolean!,
        $notifyCustomer: Boolean!
      ) {
        orderCancel(
          orderId: $orderId,
          reason: $reason,
          refund: $refund,
          restock: $restock,
          notifyCustomer: $notifyCustomer
        ) {
          job {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const response = await admin.graphql(mutation, {
        variables: {
          orderId: `gid://shopify/Order/${orderId}`,
          reason: cancelOrder.reason,
          refund: cancelOrder.refund,
          restock: cancelOrder.restock,
          notifyCustomer: true
        }
      });

      const result = await response.json();
      
      if (result.data?.orderCancel?.userErrors?.length > 0) {
        throw new Error(result.data.orderCancel.userErrors[0].message);
      }

      // Delete the record after successful cancellation
      await prisma.cancelOrder.delete({
        where: { orderId }
      });

      return result;
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  });

  return await Promise.all(cancelPromises);
} 