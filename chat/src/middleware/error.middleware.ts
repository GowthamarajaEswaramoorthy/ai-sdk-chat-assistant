import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.utils";

/**
 * Global error handling middleware
 * Catches all errors thrown in the application and returns appropriate responses
 */
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error: ${error.message}`, { stack: error.stack });

  if (error.message === "Not allowed by CORS") {
    res.status(403).json({
      status: "error",
      message: "Origin not allowed by CORS policy",
    });
    return;
  }

  if (error.message === "Path not found.") {
    res.status(404).json({
      status: "error",
      message: "Resource not found",
    });
    return;
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
