import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types";

export interface AuthPayload {
  id: number;
  role: UserRole;
  email: string;
}

export interface AuthedRequest extends Request {
  user?: AuthPayload;
}

const getToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const secret = process.env.JWT_SECRET || "change_me";
  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
};
