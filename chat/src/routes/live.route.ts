import { Router, Request, Response } from "express";
import { logger } from "../utils/logger.utils";

const router = Router();

/**
 * Liveness probe endpoint for Kubernetes/commercetools Connect
 * Returns 200 OK if the service process is alive and responding
 * This is a lightweight check - just confirms the app is running
 */
router.get("/", (req: Request, res: Response) => {
  try {
    logger.info("Liveness check: Service is alive");
    return res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Liveness check failed: ${error}`);
    return res.status(503).json({
      alive: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
