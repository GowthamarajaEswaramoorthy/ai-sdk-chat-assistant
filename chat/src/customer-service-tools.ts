import { tool } from "ai";
import { z } from "zod";
import { CustomerService } from "./services/customer.service";
import { logger } from "./utils/logger.utils";

/**
 * Creates customer service tools for the AI assistant
 */
export const createCustomerServiceTools = (
  clientId: string,
  clientSecret: string,
  projectKey: string,
  authUrl: string,
  apiUrl: string
) => {
  const customerService = new CustomerService(
    clientId,
    clientSecret,
    projectKey,
    authUrl,
    apiUrl
  );

  return {
    findCustomerByEmail: tool({
      description:
        "Search for a customer by their email address. Returns customer details including their ID, name, and contact information. Use this ONLY when you need basic customer info without orders. If the user asks about orders, use findCustomerWithOrdersByEmail instead.",
      parameters: z.object({
        email: z
          .string()
          .email()
          .describe("The email address of the customer to search for"),
      }),
      execute: async ({ email }) => {
        try {
          logger.info(`Tool: findCustomerByEmail called with ${email}`);
          const customers = await customerService.findCustomerByEmail(email);

          if (customers.length === 0) {
            return {
              success: false,
              message: `No customer found with the email ${email}`,
              customers: [],
            };
          }

          return {
            success: true,
            message: `Found ${customers.length} customer(s)`,
            customers: customers.map((customer) => ({
              id: customer.id,
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              customerNumber: customer.customerNumber,
              dateOfBirth: customer.dateOfBirth,
              addresses: customer.addresses,
              createdAt: customer.createdAt,
            })),
          };
        } catch (error) {
          logger.error("Error in findCustomerByEmail tool:", error);
          return {
            success: false,
            message: `Error searching for customer: ${error instanceof Error ? error.message : "Unknown error"}`,
            customers: [],
          };
        }
      },
    }),

    findCustomerByName: tool({
      description:
        "Search for customers by their first name and last name. Returns customer details including their ID, email, and contact information. Use this when the user provides a customer name.",
      parameters: z.object({
        firstName: z
          .string()
          .describe("The first name of the customer to search for"),
        lastName: z
          .string()
          .describe("The last name of the customer to search for"),
      }),
      execute: async ({ firstName, lastName }) => {
        try {
          logger.info(
            `Tool: findCustomerByName called with ${firstName} ${lastName}`
          );
          const customers = await customerService.findCustomersByName(
            firstName,
            lastName
          );

          if (customers.length === 0) {
            return {
              success: false,
              message: `No customers found with the name ${firstName} ${lastName}`,
              customers: [],
            };
          }

          return {
            success: true,
            message: `Found ${customers.length} customer(s)`,
            customers: customers.map((customer) => ({
              id: customer.id,
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              customerNumber: customer.customerNumber,
              dateOfBirth: customer.dateOfBirth,
              addresses: customer.addresses,
              createdAt: customer.createdAt,
            })),
          };
        } catch (error) {
          logger.error("Error in findCustomerByName tool:", error);
          return {
            success: false,
            message: `Error searching for customer: ${error instanceof Error ? error.message : "Unknown error"}`,
            customers: [],
          };
        }
      },
    }),

    getCustomerOrders: tool({
      description:
        "Retrieve all orders for a specific customer by their customer ID (UUID). Returns order details including order number, status, total amount, items, and shipping information. IMPORTANT: customerId must be a UUID, NOT an email address. Use this ONLY when you already have the customer's UUID from a previous findCustomerByEmail or findCustomerByName call. If you only have an email, use findCustomerWithOrdersByEmail instead.",
      parameters: z.object({
        customerId: z
          .string()
          .uuid()
          .describe(
            "The unique UUID of the customer (not email) whose orders to retrieve"
          ),
      }),
      execute: async ({ customerId }) => {
        try {
          logger.info(`Tool: getCustomerOrders called for ${customerId}`);
          const orders = await customerService.getCustomerOrders(customerId);

          if (orders.length === 0) {
            return {
              success: true,
              message: "No orders found for this customer",
              orders: [],
            };
          }

          return {
            success: true,
            message: `Found ${orders.length} order(s)`,
            orders: orders.map((order) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              orderState: order.orderState,
              totalPrice: order.totalPrice,
              lineItems: order.lineItems.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                variant: item.variant,
              })),
              shippingAddress: order.shippingAddress,
              billingAddress: order.billingAddress,
              createdAt: order.createdAt,
              lastModifiedAt: order.lastModifiedAt,
              customerId: order.customerId,
            })),
          };
        } catch (error) {
          logger.error("Error in getCustomerOrders tool:", error);
          return {
            success: false,
            message: `Error fetching orders: ${error instanceof Error ? error.message : "Unknown error"}`,
            orders: [],
          };
        }
      },
    }),

    findCustomerWithOrdersByEmail: tool({
      description:
        "Search for a customer by their email address and immediately retrieve all their orders. This is the PREFERRED tool when the user provides an email and asks about orders, order history, or purchases. It handles the customer ID lookup automatically and returns both customer info and all their orders in one call.",
      parameters: z.object({
        email: z
          .string()
          .email()
          .describe("The email address of the customer to search for"),
      }),
      execute: async ({ email }) => {
        try {
          logger.info(
            `Tool: findCustomerWithOrdersByEmail called with ${email}`
          );
          const result =
            await customerService.findCustomerWithOrdersByEmail(email);

          if (result.customers.length === 0) {
            return {
              success: false,
              message: `No customer found with the email ${email}`,
              customers: [],
            };
          }

          return {
            success: true,
            message: `Found ${result.customers.length} customer(s) with their orders`,
            customers: result.customers.map(({ customer, orders }) => ({
              customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                customerNumber: customer.customerNumber,
              },
              orderCount: orders.length,
              orders: orders.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                orderState: order.orderState,
                totalPrice: order.totalPrice,
                createdAt: order.createdAt,
                lineItems: order.lineItems.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity,
                  totalPrice: item.totalPrice,
                })),
              })),
            })),
          };
        } catch (error) {
          logger.error("Error in findCustomerWithOrdersByEmail tool:", error);
          return {
            success: false,
            message: `Error searching for customer with orders: ${error instanceof Error ? error.message : "Unknown error"}`,
            customers: [],
          };
        }
      },
    }),

    findCustomerWithOrders: tool({
      description:
        "Search for customers by their first and last name and immediately retrieve all their orders. This is a convenience tool that combines customer search and order retrieval in one step. Use this when the user asks for order information by providing a customer name.",
      parameters: z.object({
        firstName: z
          .string()
          .describe("The first name of the customer to search for"),
        lastName: z
          .string()
          .describe("The last name of the customer to search for"),
      }),
      execute: async ({ firstName, lastName }) => {
        try {
          logger.info(
            `Tool: findCustomerWithOrders called with ${firstName} ${lastName}`
          );
          const result = await customerService.findCustomersWithOrders(
            firstName,
            lastName
          );

          if (result.customers.length === 0) {
            return {
              success: false,
              message: `No customers found with the name ${firstName} ${lastName}`,
              customers: [],
            };
          }

          return {
            success: true,
            message: `Found ${result.customers.length} customer(s) with their orders`,
            customers: result.customers.map(({ customer, orders }) => ({
              customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                customerNumber: customer.customerNumber,
              },
              orderCount: orders.length,
              orders: orders.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                orderState: order.orderState,
                totalPrice: order.totalPrice,
                createdAt: order.createdAt,
                lineItems: order.lineItems.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity,
                  totalPrice: item.totalPrice,
                })),
              })),
            })),
          };
        } catch (error) {
          logger.error("Error in findCustomerWithOrders tool:", error);
          return {
            success: false,
            message: `Error searching for customer with orders: ${error instanceof Error ? error.message : "Unknown error"}`,
            customers: [],
          };
        }
      },
    }),

    getOrderByNumber: tool({
      description:
        "Retrieve a specific order by its order number. Use this when the user provides an order number (e.g., 'order #12345' or 'order number 12345'). Returns complete order details including line items, addresses, and return information.",
      parameters: z.object({
        orderNumber: z
          .string()
          .describe("The order number to retrieve (e.g., '12345')"),
      }),
      execute: async ({ orderNumber }) => {
        try {
          logger.info(`Tool: getOrderByNumber called with ${orderNumber}`);
          const order =
            await customerService.getOrderByOrderNumber(orderNumber);

          return {
            success: true,
            message: `Found order ${orderNumber}`,
            order: {
              id: order.id,
              version: order.version,
              orderNumber: order.orderNumber,
              orderState: order.orderState,
              shipmentState: order.shipmentState,
              paymentState: order.paymentState,
              totalPrice: order.totalPrice,
              lineItems: order.lineItems.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                productId: item.productId,
                variant: item.variant,
              })),
              customLineItems: order.customLineItems,
              shippingAddress: order.shippingAddress,
              billingAddress: order.billingAddress,
              customerId: order.customerId,
              customerEmail: order.customerEmail,
              returnInfo: order.returnInfo,
              createdAt: order.createdAt,
              lastModifiedAt: order.lastModifiedAt,
            },
          };
        } catch (error) {
          logger.error("Error in getOrderByNumber tool:", error);
          return {
            success: false,
            message: `Error fetching order: ${error instanceof Error ? error.message : "Unknown error"}`,
            order: null,
          };
        }
      },
    }),

    getOrderById: tool({
      description:
        "Retrieve a specific order by its Order ID (UUID). Use this when the user provides an Order ID like '2d4fef47-ddb6-4db0-9811-7f867b4bea1b'. This is the internal UUID identifier, not the order number. Returns complete order details including line items, addresses, and return information.",
      parameters: z.object({
        orderId: z.string().uuid().describe("The Order ID (UUID) to retrieve"),
      }),
      execute: async ({ orderId }) => {
        try {
          logger.info(`Tool: getOrderById called with ${orderId}`);
          const order = await customerService.getOrderById(orderId);

          return {
            success: true,
            message: `Found order with ID ${orderId}`,
            order: {
              id: order.id,
              version: order.version,
              orderNumber: order.orderNumber,
              orderState: order.orderState,
              shipmentState: order.shipmentState,
              paymentState: order.paymentState,
              totalPrice: order.totalPrice,
              lineItems: order.lineItems.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
                productId: item.productId,
                variant: item.variant,
              })),
              customLineItems: order.customLineItems,
              shippingAddress: order.shippingAddress,
              billingAddress: order.billingAddress,
              customerId: order.customerId,
              customerEmail: order.customerEmail,
              returnInfo: order.returnInfo,
              createdAt: order.createdAt,
              lastModifiedAt: order.lastModifiedAt,
            },
          };
        } catch (error) {
          logger.error("Error in getOrderById tool:", error);
          return {
            success: false,
            message: `Error fetching order: ${error instanceof Error ? error.message : "Unknown error"}`,
            order: null,
          };
        }
      },
    }),

    startOrderReturn: tool({
      description:
        "Start a return for ALL items in an order. Use this when a customer wants to return items from their order by providing just the Order ID/number and their email. This tool will automatically return ALL line items with their full quantities. You can provide either the Order ID (UUID) or order number. The order must exist and belong to the customer.",
      parameters: z.object({
        orderId: z
          .string()
          .optional()
          .describe(
            "The Order ID (UUID) for which to start a return. Provide either orderId or orderNumber, not both."
          ),
        orderNumber: z
          .string()
          .optional()
          .describe(
            "The order number for which to start a return. Provide either orderId or orderNumber, not both."
          ),
        returnItems: z
          .array(
            z.object({
              lineItemId: z
                .string()
                .optional()
                .describe(
                  "The ID of the line item to return (for regular items)"
                ),
              customLineItemId: z
                .string()
                .optional()
                .describe("The ID of the custom line item to return"),
              quantity: z
                .number()
                .positive()
                .describe("The quantity of items to return"),
              comment: z
                .string()
                .optional()
                .describe("Optional comment about the return reason"),
              shipmentState: z
                .enum(["Advised", "Returned"])
                .describe(
                  "Shipment state: 'Returned' for refundable items, 'Advised' for non-refundable items"
                ),
            })
          )
          .optional()
          .describe(
            "OPTIONAL: Array of specific items to return. If not provided, ALL items in the order will be returned automatically with their full quantities."
          ),
        returnTrackingId: z
          .string()
          .optional()
          .describe("Optional tracking ID for the return shipment"),
      }),
      execute: async ({
        orderId,
        orderNumber,
        returnItems,
        returnTrackingId,
      }) => {
        try {
          if (!orderId && !orderNumber) {
            return {
              success: false,
              message: "Either orderId or orderNumber must be provided",
              order: null,
            };
          }

          if (orderId && orderNumber) {
            return {
              success: false,
              message: "Provide either orderId or orderNumber, not both",
              order: null,
            };
          }

          const identifier = orderId || orderNumber;
          logger.info(`Tool: startOrderReturn called for order ${identifier}`);

          const order = orderId
            ? await customerService.getOrderById(orderId)
            : await customerService.getOrderByOrderNumber(orderNumber!);

          let itemsToReturn = returnItems;
          if (!itemsToReturn || itemsToReturn.length === 0) {
            logger.info(
              `No specific items provided - automatically returning ALL ${order.lineItems.length} line items`
            );
            itemsToReturn = order.lineItems.map((lineItem) => ({
              lineItemId: lineItem.id,
              quantity: lineItem.quantity,
              comment:
                "Customer requested to return all items from this order.",
              shipmentState: "Returned" as const,
            }));
          }

          for (const returnItem of itemsToReturn) {
            if (returnItem.lineItemId) {
              const lineItem = order.lineItems.find(
                (item) => item.id === returnItem.lineItemId
              );
              if (!lineItem) {
                return {
                  success: false,
                  message: `Line item with ID ${returnItem.lineItemId} not found in order ${order.orderNumber || order.id}`,
                  order: null,
                };
              }
              if (returnItem.quantity > lineItem.quantity) {
                return {
                  success: false,
                  message: `Cannot return ${returnItem.quantity} items of '${lineItem.name}' - only ${lineItem.quantity} were ordered`,
                  order: null,
                };
              }
            }
          }

          const updatedOrder = await customerService.addReturnToOrder(
            order.id,
            order.version,
            itemsToReturn,
            returnTrackingId
          );

          return {
            success: true,
            message: `Successfully started return for order ${order.orderNumber || order.id}`,
            order: {
              id: updatedOrder.id,
              version: updatedOrder.version,
              orderNumber: updatedOrder.orderNumber,
              orderState: updatedOrder.orderState,
              returnInfo: updatedOrder.returnInfo,
              returnedItems: itemsToReturn.map((item) => {
                const lineItem = order.lineItems.find(
                  (li) => li.id === item.lineItemId
                );
                return {
                  lineItemId: item.lineItemId,
                  productName: lineItem?.name,
                  quantity: item.quantity,
                  comment: item.comment,
                  shipmentState: item.shipmentState,
                };
              }),
            },
          };
        } catch (error) {
          logger.error("Error in startOrderReturn tool:", error);
          return {
            success: false,
            message: `Error starting return: ${error instanceof Error ? error.message : "Unknown error"}`,
            order: null,
          };
        }
      },
    }),
  };
};
