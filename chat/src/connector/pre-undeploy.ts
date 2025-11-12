/**
 * Pre-undeploy script for commercetools Connect
 *
 * This script runs before the connector is removed from commercetools Connect.
 * Use it to clean up any resources that were created during deployment such as:
 * - API Extensions
 * - Subscriptions
 * - Custom Types (if safe to remove)
 * - Temporary data
 *
 * For this chat assistant, we don't need to clean up any commercetools resources
 * as it's a stateless service without persistent commercetools configuration.
 */

import { logger } from "../utils/logger.utils";

async function preUndeploy(): Promise<void> {
  try {
    logger.info("Starting pre-undeploy script...");

    const requiredEnvVars = [
      "CTP_PROJECT_KEY",
      "CTP_CLIENT_ID",
      "CTP_CLIENT_SECRET",
      "CTP_AUTH_URL",
      "CTP_API_URL",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      logger.warn(`Missing environment variables: ${missingVars.join(", ")}`);
      logger.warn("Skipping cleanup that requires commercetools API access");
    } else {
      logger.info("Environment variables validated successfully");
    }

    logger.info("Pre-undeploy script completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error(`Pre-undeploy script failed: ${error}`);
    logger.warn("Continuing with undeploy despite cleanup errors");
    process.exit(0);
  }
}

preUndeploy();
