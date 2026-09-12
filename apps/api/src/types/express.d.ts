// src/types/express.d.ts
declare module "express-serve-static-core" {
  interface Request {
    id?: string;
    requestId?: string;
    user?: AuthUser;
    rawBody?: Buffer;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
  userName?: string | null;
  username?: string | null;
}

