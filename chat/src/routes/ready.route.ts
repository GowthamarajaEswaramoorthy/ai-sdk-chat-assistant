import { Router, Request, Response } from "express";
import { logger } from "../utils/logger.utils";
import ModelProvider from "../services/modelProvider";

const router = Router();

/**
 * Readiness probe endpoint for Kubernetes/commercetools Connect
 * Returns 200 OK if service is ready to accept traffic
 * Checks: AI model initialized, environment variables present
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const modelProvider = ModelProvider.getInstance();
    const model = modelProvider.getModel();

    if (!model) {
      logger.warn("Readiness check: AI model not initialized");
      return res.status(503).json({
        ready: false,
        reason: "AI model not initialized",
        timestamp: new Date().toISOString(),
      });
    }

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
      logger.warn(
        `Readiness check: Missing environment variables: ${missingVars.join(", ")}`
      );
      return res.status(503).json({
        ready: false,
        reason: "Missing required environment variables",
        missingVariables: missingVars,
        timestamp: new Date().toISOString(),
      });
    }

    if (process.env.AI_PROVIDER === "openai" && !process.env.OPENAI_API_KEY) {
      logger.warn("Readiness check: OpenAI API key not configured");
      return res.status(503).json({
        ready: false,
        reason: "OpenAI API key not configured",
        timestamp: new Date().toISOString(),
      });
    }

    if (
      process.env.AI_PROVIDER === "anthropic" &&
      !process.env.ANTHROPIC_API_KEY
    ) {
      logger.warn("Readiness check: Anthropic API key not configured");
      return res.status(503).json({
        ready: false,
        reason: "Anthropic API key not configured",
        timestamp: new Date().toISOString(),
      });
    }

    logger.info("Readiness check: Service is ready");
    return res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Readiness check failed: ${error}`);
    return res.status(503).json({
      ready: false,
      reason: "Readiness check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
