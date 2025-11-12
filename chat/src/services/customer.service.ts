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
