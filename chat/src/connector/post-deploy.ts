/**
 * Post-deploy script for commercetools Connect
 *
 * This script runs after the connector is deployed to commercetools Connect.
 * Use it to set up any required resources such as:
 * - API Extensions
 * - Subscriptions
 * - Custom Types
 * - Initial data
 *
 * For this chat assistant, we don't need to set up any commercetools resources
 * as it's a stateless service that responds to HTTP requests.
 */

import { logger } from "../utils/logger.utils";

async function postDeploy(): Promise<void> {
  try {
    logger.info("Starting post-deploy script...");

    const requiredEnvVars = [
      "CTP_PROJECT_KEY",
      "CTP_CLIENT_ID",
      "CTP_CLIENT_SECRET",
      "CTP_AUTH_URL",
      "CTP_API_URL",
      "AI_PROVIDER",
      "AI_MODEL",
      "JWT_SECRET",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      logger.error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
      process.exit(1);
    }

    logger.info("Environment variables validated successfully");

    if (process.env.AI_PROVIDER === "openai" && !process.env.OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY is required when AI_PROVIDER is "openai"');
      process.exit(1);
    }

    if (
      process.env.AI_PROVIDER === "anthropic" &&
      !process.env.ANTHROPIC_API_KEY
    ) {
      logger.error(
        'ANTHROPIC_API_KEY is required when AI_PROVIDER is "anthropic"'
      );
      process.exit(1);
    }

    logger.info("AI provider credentials validated successfully");

    logger.info("Post-deploy script completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error(`Post-deploy script failed: ${error}`);
    process.exit(1);
  }
}

postDeploy();
