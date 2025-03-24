import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";

const prisma = new PrismaClient();

// Database operations
export async function getCancelOrders() {
  return await prisma.cancelOrder.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getTotalFlaggedOrders() {
  try {
    const flaggedOrders = await prisma.$transaction(tx => tx.cancelOrder.count());
    return flaggedOrders;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

// Shopify GraphQL operations
export const shopifyOperations = {
  CANCEL_ORDER_MUTATION: `
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
  `,

  async cancelOrder(admin, { orderId, reason, refund, restock, notifyCustomer = true }) {
    try {
      const response = await admin.graphql(this.CANCEL_ORDER_MUTATION, {
        variables: {
          orderId: `gid://shopify/Order/${orderId}`,
          reason,
          refund,
          restock,
          notifyCustomer
        }
      });

      const result = await response.json();
      
      if (result.data?.orderCancel?.userErrors?.length > 0) {
        throw new Error(result.data.orderCancel.userErrors[0].message);
      }

      return result;
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  }
};


// use this function to cancel orders in Shopify
export async function cancelOrders(request, orderIds) {
  const { admin } = await authenticate.admin(request);
  
  try {
    const cancelPromises = orderIds.map(orderId => 
      shopifyOperations.cancelOrder(admin, {
        orderId,
        reason: "CUSTOMER", // Default reason
        refund: true,      // Default to refund
        restock: true      // Default to restock
      })
    );

    await Promise.all(cancelPromises);
    return true;
  } catch (error) {
    console.error("Error cancelling orders:", error);
    throw error;
  }
}

// Main function combining database and Shopify operations (only for cancelOrders page)
// export async function cancelOrdersInShopify(request, orderIds) {
//   const { admin } = await authenticate.admin(request);
  
//   const cancelPromises = orderIds.map(async (orderId) => {
//     const cancelOrder = await prisma.cancelOrder.findUnique({
//       where: { orderId }
//     });

//     if (!cancelOrder) return null;

//     const result = await shopifyOperations.cancelOrder(admin, {
//       orderId,
//       reason: cancelOrder.reason,
//       refund: cancelOrder.refund,
//       restock: cancelOrder.restock
//     });

//     // Only delete the record after successful cancellation
//     await prisma.cancelOrder.delete({
//       where: { orderId }
//     });

//     return result;
//   });

//   return await Promise.all(cancelPromises);
// }