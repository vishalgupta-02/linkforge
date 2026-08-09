// src/types/express.d.ts
declare module "express-serve-static-core" {
  interface Request {
    user: AuthUser;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
}
