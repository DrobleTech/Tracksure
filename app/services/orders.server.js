import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ORDERS_QUERY = `#graphql
  query getOrders($cursor: String) {
    orders(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          email
          phone
          createdAt
          processedAt
          tags
          displayFinancialStatus
          displayFulfillmentStatus
          riskLevel
          paymentGatewayNames
          billingAddress {
            address1
            address2
            city
            province
            country
            zip
          }
          customer {
            id
            firstName
            lastName
            email
            phone
            state
            tags
          }
          lineItems(first: 1) {
            edges {
              node {
                product {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function syncAllOrders(client) {
  let hasNextPage = true;
  let cursor = null;
  let totalOrders = 0;
  let successCount = 0;
  let errorCount = 0;

  console.log('Starting order synchronization...');

  try {
    while (hasNextPage) {
      console.log('Fetching orders batch with cursor:', cursor);
      
      const response = await client(ORDERS_QUERY, {
        variables: { cursor },
      });

      // Parse the response body
      const responseText = await response.text();
      const responseData = JSON.parse(responseText);
      console.log('Response Data:', responseData);

      if (!responseData || !responseData.data || !responseData.data.orders) {
        throw new Error('Invalid response format from GraphQL API');
      }

      const { orders } = responseData.data;
      const batchSize = orders.edges.length;
      totalOrders += batchSize;
      
      console.log(`Processing batch of ${batchSize} orders...`);
      
      for (const { node: order } of orders.edges) {
        try {
          console.log(`Processing order ${order.id}:`, {
            orderNumber: order.id.split('/').pop(),
            status: order.displayFinancialStatus,
            fulfillmentStatus: order.displayFulfillmentStatus
          });
          
          console.log('Order:', order);
          await upsertOrder(order);
          successCount++;
          
          console.log(`Successfully processed order ${order.id}`);
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error);
          errorCount++;
        }
      }

      hasNextPage = orders.pageInfo.hasNextPage;
      cursor = orders.pageInfo.endCursor;
      
      console.log('Batch complete. Progress:', {
        totalProcessed: totalOrders,
        successful: successCount,
        errors: errorCount
      });
    }

    console.log('Order synchronization complete:', {
      totalOrders,
      successCount,
      errorCount
    });

  } catch (error) {
    console.error('Fatal error during order sync:', error);
    throw error;
  }
}

export async function upsertOrder(shopifyOrder) {
  try {
    if (!shopifyOrder || !shopifyOrder.id) {
      throw new Error('Invalid order data received');
    }
    
    // Extract numeric order ID from Shopify GraphQL ID
    const orderId = shopifyOrder.id.split('/').pop();
    
    // Combine address fields into a single string
    const fullAddress = shopifyOrder.billingAddress ? 
      [
        shopifyOrder.billingAddress.address1,
        shopifyOrder.billingAddress.address2,
        shopifyOrder.billingAddress.city,
        shopifyOrder.billingAddress.province,
        shopifyOrder.billingAddress.country,
        shopifyOrder.billingAddress.zip
      ].filter(Boolean).join(', ') : '';

    // Extract product ID from first line item if available
    let productId;
    if (shopifyOrder.lineItems?.edges?.[0]?.node?.product?.id) {
      const rawProductId = shopifyOrder.lineItems.edges[0].node.product.id.split('/').pop();
      productId = parseInt(rawProductId);
    }

    console.log('Product ID:', productId);

    if (!productId) {
      throw new Error('No valid product ID found in order line items');
    }

    // Handle customer data first
    let customerId = null;
    if (shopifyOrder.customer) {
      const customerData = {
        id: shopifyOrder.customer.id.split('/').pop(),
        firstName: shopifyOrder.customer.firstName || null,
        lastName: shopifyOrder.customer.lastName || null,
        email: shopifyOrder.customer.email,
        phone: shopifyOrder.customer.phone || null,
        state: shopifyOrder.customer.state || null,
        tags: shopifyOrder.customer.tags?.join(',') || null
      };

      // Upsert customer
      const customer = await prisma.customer.upsert({
        where: { id: customerData.id },
        create: customerData,
        update: customerData
      });

      customerId = customer.id;
    }

    // Prepare order data matching Prisma schema types
    const orderData = {
      orderDate: new Date(shopifyOrder.createdAt || new Date()),
      name: shopifyOrder.customer.firstName + ' ' + shopifyOrder.customer.lastName || 'Unnamed Order',
      email: shopifyOrder.email || '',  // Schema requires non-null
      phone: shopifyOrder.phone || '',  // Schema requires non-null
      orderId: orderId,
      productId: productId,
      payment: mapFinancialStatus(shopifyOrder.displayFinancialStatus),
      paymentMethod: mapPaymentMethod(shopifyOrder.paymentGatewayNames?.[0]),
      tier: 'Standard',
      address: fullAddress || 'No address provided',
      customerId: customerId,  // Add customer relation
      riskVerification: mapRiskStatus(shopifyOrder.riskLevel),
      tags: shopifyOrder.tags?.join(',') || null,  // Optional in schema
      otp: 'NOT_SENT',
      ivr: 'PENDING',
      shipmentStatus: mapFulfillmentStatus(shopifyOrder.displayFulfillmentStatus)
    };

    console.log('Attempting to upsert order with data:', JSON.stringify(orderData, null, 2));

    // Perform the upsert operation
    const result = await prisma.order.upsert({
      where: {
        orderId: orderId
      },
      create: orderData,
      update: orderData,
    });
    
    console.log('Order upsert successful:', {
      orderId: result.orderId,
      name: result.name
    });
    
    return result;

  } catch (error) {
    console.error('Error upserting order:', {
      orderId: shopifyOrder?.id,
      error: error.message,
      stack: error.stack,
      data: shopifyOrder
    });
    throw error;
  }
}

function mapFinancialStatus(status) {
  if (!status) return 'PENDING';
  
  const statusMap = {
    'AUTHORIZED': 'AUTHORIZED',
    'PAID': 'PAID',
    'PARTIALLY_PAID': 'PARTIALLY_PAID',
    'PARTIALLY_REFUNDED': 'PARTIALLY_REFUNDED',
    'PENDING': 'PENDING',
    'REFUNDED': 'REFUNDED',
    'VOIDED': 'VOIDED'
  };
  return statusMap[status] || 'PENDING';
}

function mapFulfillmentStatus(status) {
  if (!status) return 'UNFULFILLED';
  
  const statusMap = {
    'FULFILLED': 'FULFILLED',
    'PARTIAL': 'PARTIAL',
    'UNFULFILLED': 'UNFULFILLED',
    'DELIVERED': 'DELIVERED',
    'IN_TRANSIT': 'IN_TRANSIT',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'ATTEMPTED': 'ATTEMPTED',
    'FAILED': 'FAILED',
    'CANCELLED': 'CANCELLED',
    'ON_HOLD': 'ON_HOLD',
    'RETURNED': 'RETURNED'
  };
  return statusMap[status] || 'UNFULFILLED';
}

function mapPaymentMethod(method) {
  if (!method) return 'CREDIT_CARD';
  
  const methodMap = {
    'credit_card': 'CREDIT_CARD',
    'debit': 'DEBIT',
    'paypal': 'PAYPAL',
    'shopify_pay': 'SHOP_PAY',
    'apple_pay': 'APPLE_PAY',
    'google_pay': 'GOOGLE_PAY',
    'bank_deposit': 'BANK_TRANSFER',
    'cash_on_delivery': 'CASH_ON_DELIVERY',
    'manual': 'BANK_TRANSFER'
  };
  return methodMap[method.toLowerCase()] || 'CREDIT_CARD';
}

function mapRiskStatus(risk) {
  if (!risk) return 'PENDING';
  
  const riskMap = {
    'high': 'HIGH',
    'medium': 'MEDIUM',
    'low': 'LOW',
    'verified': 'VERIFIED',
    'pending': 'PENDING'
  };
  return riskMap[risk?.toLowerCase()] || 'PENDING';
} 