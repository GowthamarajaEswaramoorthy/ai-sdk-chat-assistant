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
        "Search for a customer by their email address. Returns customer details including their ID, name, and contact information. Use this when the user provides a customer email address.",
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
        "Retrieve all orders for a specific customer by their customer ID. Returns order details including order number, status, total amount, items, and shipping information. Use this after finding a customer to get their order history.",
      parameters: z.object({
        customerId: z
          .string()
          .describe("The unique ID of the customer whose orders to retrieve"),
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
        "Search for a customer by their email address and immediately retrieve all their orders. This is a convenience tool that combines customer search and order retrieval in one step. Use this when the user asks for order information by providing a customer email address.",
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
  };
};
