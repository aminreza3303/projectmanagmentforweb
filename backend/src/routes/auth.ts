import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler";
import { registerSchema, loginSchema } from "../utils/validators";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { safeLogActivity } from "../utils/activity";

const router = Router();

const signToken = (user: { id: number; role: string; email: string }) => {
  const secret = process.env.JWT_SECRET || "change_me";
  const expiresInRaw = process.env.JWT_EXPIRES_IN || "1d";
  const options: SignOptions = { expiresIn: expiresInRaw as any };
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, options);
};

const actorIdFromAuthorization = (authorization?: string): number | undefined => {
  if (!authorization) return undefined;
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) return undefined;
  const secret = process.env.JWT_SECRET || "change_me";
  try {
    const payload = jwt.verify(token, secret) as { id?: unknown };
    return typeof payload.id === "number" ? payload.id : undefined;
  } catch {
    return undefined;
  }
};

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password,
        role: data.role || "member"
      }
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: { ...user, password: undefined } });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    safeLogActivity({
      actorId: user.id,
      action: "auth.login",
      message: `User logged in: ${user.email}`
    });
    return res.json({ token, user: { ...user, password: undefined } });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const actorId = actorIdFromAuthorization(req.headers.authorization);
    if (actorId) {
      safeLogActivity({
        actorId,
        action: "auth.logout",
        message: `User logged out`
      });
    }
    return res.json({ message: "Logged out" });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ ...user, password: undefined });
  })
);

export default router;
