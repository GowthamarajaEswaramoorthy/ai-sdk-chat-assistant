import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from "@commercetools/sdk-client-v2";
import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";
import type {
  Customer,
  Order,
  CustomerPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { logger } from "../utils/logger.utils";

export class CustomerService {
  private apiRoot: any;

  constructor(
    clientId: string,
    clientSecret: string,
    projectKey: string,
    authUrl: string,
    apiUrl: string
  ) {
    const authMiddlewareOptions: AuthMiddlewareOptions = {
      host: authUrl,
      projectKey: projectKey,
      credentials: {
        clientId: clientId,
        clientSecret: clientSecret,
      },
      scopes: [`manage_project:${projectKey}`],
      fetch,
    };

    const httpMiddlewareOptions: HttpMiddlewareOptions = {
      host: apiUrl,
      fetch,
    };

    const ctpClient = new ClientBuilder()
      .withProjectKey(projectKey)
      .withClientCredentialsFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .withLoggerMiddleware()
      .build();

    this.apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
      projectKey,
    });
  }

  /**
   * Find customer by email address
   * @param email Customer's email address
   * @returns Array of matching customers
   */
  async findCustomerByEmail(email: string): Promise<Customer[]> {
    try {
      logger.info(`Searching for customer by email: ${email}`);

      const response = await this.apiRoot
        .customers()
        .get({
          queryArgs: {
            where: `email="${email}"`,
          },
        })
        .execute();

      const customerResponse = response.body as CustomerPagedQueryResponse;
      logger.info(`Found ${customerResponse.results.length} customers`);

      return customerResponse.results;
    } catch (error) {
      logger.error("Error finding customer by email:", error);
      throw new Error(
        `Failed to find customer: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find customers by first name and last name
   * @param firstName Customer's first name
   * @param lastName Customer's last name
   * @returns Array of matching customers
   */
  async findCustomersByName(
    firstName: string,
    lastName: string
  ): Promise<Customer[]> {
    try {
      logger.info(`Searching for customers: ${firstName} ${lastName}`);

      const response = await this.apiRoot
        .customers()
        .get({
          queryArgs: {
            where: `firstName="${firstName}" and lastName="${lastName}"`,
          },
        })
        .execute();

      const customerResponse = response.body as CustomerPagedQueryResponse;
      logger.info(`Found ${customerResponse.results.length} customers`);

      return customerResponse.results;
    } catch (error) {
      logger.error("Error finding customers:", error);
      throw new Error(
        `Failed to find customers: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get orders for a specific customer
   * @param customerId Customer ID
   * @returns Array of orders for the customer
   */
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      logger.info(`Fetching orders for customer: ${customerId}`);

      const response = await this.apiRoot
        .orders()
        .get({
          queryArgs: {
            where: `customerId="${customerId}"`,
            sort: "createdAt desc",
          },
        })
        .execute();

      logger.info(`Found ${response.body.results.length} orders`);

      return response.body.results;
    } catch (error) {
      logger.error("Error fetching customer orders:", error);
      throw new Error(
        `Failed to fetch customer orders: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get order by ID
   * @param orderId Order ID
   * @returns Order details
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      logger.info(`Fetching order by ID: ${orderId}`);

      const response = await this.apiRoot
        .orders()
        .withId({ ID: orderId })
        .get()
        .execute();

      logger.info(
        `Found order: ${response.body.orderNumber || response.body.id}`
      );

      return response.body;
    } catch (error) {
      logger.error("Error fetching order by ID:", error);
      throw new Error(
        `Failed to fetch order: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get order by order number
   * @param orderNumber Order number
   * @returns Order details
   */
  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    try {
      logger.info(`Fetching order by order number: ${orderNumber}`);

      const response = await this.apiRoot
        .orders()
        .withOrderNumber({ orderNumber })
        .get()
        .execute();

      logger.info(
        `Found order: ${response.body.orderNumber || response.body.id}`
      );

      return response.body;
    } catch (error) {
      logger.error("Error fetching order by order number:", error);
      throw new Error(
        `Failed to fetch order: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Add return info to an order
   * @param orderId Order ID
   * @param version Current version of the order
   * @param returnItems Items to return
   * @param returnTrackingId Optional tracking ID for the return
   * @returns Updated order with return info
   */
  async addReturnToOrder(
    orderId: string,
    version: number,
    returnItems: Array<{
      lineItemId?: string;
      customLineItemId?: string;
      quantity: number;
      comment?: string;
      shipmentState: "Advised" | "Returned";
    }>,
    returnTrackingId?: string
  ): Promise<Order> {
    try {
      logger.info(`Adding return info to order: ${orderId}`);

      const response = await this.apiRoot
        .orders()
        .withId({ ID: orderId })
        .post({
          body: {
            version,
            actions: [
              {
                action: "addReturnInfo",
                returnTrackingId,
                returnDate: new Date().toISOString(),
                items: returnItems.map((item) => ({
                  quantity: item.quantity,
                  lineItemId: item.lineItemId,
                  customLineItemId: item.customLineItemId,
                  comment: item.comment,
                  shipmentState: item.shipmentState,
                })),
              },
            ],
          },
        })
        .execute();

      logger.info(`Successfully added return info to order ${orderId}`);

      return response.body;
    } catch (error) {
      logger.error("Error adding return to order:", error);
      throw new Error(
        `Failed to add return to order: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find customer by email and return their orders
   * @param email Customer's email address
   * @returns Object containing customer and their orders
   */
  async findCustomerWithOrdersByEmail(email: string): Promise<{
    customers: Array<{
      customer: Customer;
      orders: Order[];
    }>;
  }> {
    try {
      const customers = await this.findCustomerByEmail(email);

      if (customers.length === 0) {
        return { customers: [] };
      }

      const customersWithOrders = await Promise.all(
        customers.map(async (customer) => {
          const orders = await this.getCustomerOrders(customer.id);
          return {
            customer,
            orders,
          };
        })
      );

      return { customers: customersWithOrders };
    } catch (error) {
      logger.error("Error finding customer with orders by email:", error);
      throw error;
    }
  }

  /**
   * Find customers by name and return their orders
   * @param firstName Customer's first name
   * @param lastName Customer's last name
   * @returns Object containing customers and their orders
   */
  async findCustomersWithOrders(
    firstName: string,
    lastName: string
  ): Promise<{
    customers: Array<{
      customer: Customer;
      orders: Order[];
    }>;
  }> {
    try {
      const customers = await this.findCustomersByName(firstName, lastName);

      if (customers.length === 0) {
        return { customers: [] };
      }

      const customersWithOrders = await Promise.all(
        customers.map(async (customer) => {
          const orders = await this.getCustomerOrders(customer.id);
          return {
            customer,
            orders,
          };
        })
      );

      return { customers: customersWithOrders };
    } catch (error) {
      logger.error("Error finding customers with orders:", error);
      throw error;
    }
  }
}
