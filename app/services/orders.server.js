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
            displayName
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

  try {
    while (hasNextPage) {
      const response = await client(ORDERS_QUERY, {
        variables: { cursor },
      });

      const responseText = await response.text();
      const responseData = JSON.parse(responseText);

      if (!responseData?.data?.orders) {
        throw new Error('Invalid response format from GraphQL API');
      }

      const { orders } = responseData.data;
      totalOrders += orders.edges.length;
      
      for (const { node: order } of orders.edges) {
        try {
          await upsertOrder(order);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      hasNextPage = orders.pageInfo.hasNextPage;
      cursor = orders.pageInfo.endCursor;
    }

    return { totalOrders, successCount, errorCount };
  } catch (error) {
    throw error;
  }
}

export async function upsertOrder(shopifyOrder) {
  if (!shopifyOrder?.id) {
    throw new Error('Invalid order data received');
  }
  
  const orderId = shopifyOrder.id.split('/').pop();
  
  const fullAddress = shopifyOrder.billingAddress ? 
    [
      shopifyOrder.billingAddress.address1,
      shopifyOrder.billingAddress.address2,
      shopifyOrder.billingAddress.city,
      shopifyOrder.billingAddress.province,
      shopifyOrder.billingAddress.country,
      shopifyOrder.billingAddress.zip
    ].filter(Boolean).join(', ') : '';

  let productId;
  if (shopifyOrder.lineItems?.edges?.[0]?.node?.product?.id) {
    const rawProductId = shopifyOrder.lineItems.edges[0].node.product.id.split('/').pop();
    productId = parseInt(rawProductId);
  }

  if (!productId) {
    throw new Error('No valid product ID found in order line items');
  }

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

    const customer = await prisma.customer.upsert({
      where: { id: customerData.id },
      create: customerData,
      update: customerData
    });

    customerId = customer.id;
  }

  const orderData = {
    orderDate: new Date(shopifyOrder.createdAt || new Date()),
    name: (shopifyOrder.customer != null ? 
      `${shopifyOrder.customer.firstName} ${shopifyOrder.customer.lastName} Order` : 
      'Unnamed Order'),
    email: shopifyOrder.email || '',
    phone: shopifyOrder.phone || '',
    orderId: orderId,
    productId: productId,
    payment: mapFinancialStatus(shopifyOrder.displayFinancialStatus),
    paymentMethod: mapPaymentMethod(shopifyOrder.paymentGatewayNames?.[0]),
    tier: 'Standard',
    address: fullAddress || 'No address provided',
    customerId: customerId,
    riskVerification: mapRiskStatus(shopifyOrder.riskLevel),
    tags: shopifyOrder.tags?.join(',') || null,
    otp: 'NOT_SENT',
    ivr: 'PENDING',
    shipmentStatus: mapFulfillmentStatus(shopifyOrder.displayFulfillmentStatus)
  };

  return prisma.order.upsert({
    where: { orderId },
    create: orderData,
    update: orderData,
  });
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