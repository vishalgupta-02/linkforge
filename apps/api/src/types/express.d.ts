export interface AuthUser {
  id: string;
  email: string;
  plan: string;
  userName?: string | null;
  username?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      requestId?: string;
      user?: AuthUser;
      rawBody?: Buffer;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    id?: string;
    requestId?: string;
    user?: AuthUser;
    rawBody?: Buffer;
  }
}

declare module "express" {
  interface Request {
    id?: string;
    requestId?: string;
    user?: AuthUser;
    rawBody?: Buffer;
  }
}
