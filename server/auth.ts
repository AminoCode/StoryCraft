import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const DEFAULT_USER = {
  id: "local-user",
  email: "local@example.com",
  firstName: "Local",
  lastName: "User",
};

export async function setupAuth(app: Express) {
  await storage.upsertUser(DEFAULT_USER);
  app.use((req: any, _res: Response, next: NextFunction) => {
    req.user = { claims: { sub: DEFAULT_USER.id } };
    next();
  });
}

export function isAuthenticated(_req: Request, _res: Response, next: NextFunction) {
  next();
}
