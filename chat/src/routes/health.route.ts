import { Router, Request, Response } from "express";
import { logger } from "../utils/logger.utils";
import ModelProvider from "../services/modelProvider";

const router = Router();

/**
 * Health check endpoint for commercetools Connect platform
 * Returns 200 OK if service is healthy
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const modelProvider = ModelProvider.getInstance();
    const model = modelProvider.getModel();

    if (!model) {
      logger.warn("Health check: AI model not initialized");
      return res.status(503).json({
        status: "unhealthy",
        message: "AI model not initialized",
        timestamp: new Date().toISOString(),
      });
    }

    const requiredEnvVars = [
      "CTP_PROJECT_KEY",
      "CTP_CLIENT_ID",
      "CTP_CLIENT_SECRET",
      "AI_PROVIDER",
      "AI_MODEL",
      "JWT_SECRET",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      logger.warn(
        `Health check: Missing environment variables: ${missingVars.join(", ")}`
      );
      return res.status(503).json({
        status: "unhealthy",
        message: "Missing required environment variables",
        missingVariables: missingVars,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info("Health check: Service is healthy");
    return res.status(200).json({
      status: "healthy",
      service: "ai-sdk-chat-assistant",
      version: "1.0.0",
      aiProvider: process.env.AI_PROVIDER,
      aiModel: process.env.AI_MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Health check failed: ${error}`);
    return res.status(503).json({
      status: "unhealthy",
      message: "Service health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
