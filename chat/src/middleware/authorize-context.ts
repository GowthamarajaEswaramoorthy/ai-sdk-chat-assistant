import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.utils";

declare global {
  namespace Express {
    interface Request {
      user?: {
        customerId?: string;
        cartId?: string;
      };
    }
  }
}

export const genericAtuhCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET is not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  if (!authHeader) {
    logger.warn("No authorization header provided");
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    logger.warn("Invalid authorization header format");
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    req.user = {
      customerId: decoded.customerId,
      cartId: decoded.cartId,
    };

    const userType = decoded.customerId ? "authenticated" : "guest";
    logger.info(
      "Authenticated user: " +
        (decoded.customerId || "guest") +
        ", cartId: " +
        (decoded.cartId || "none")
    );

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.error("Token expired:", error);
      return res.status(401).json({ message: "Unauthorized - Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.error("Invalid token:", error);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    } else {
      logger.error("Error verifying token:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
};
