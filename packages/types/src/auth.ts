export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface GenericAuthResponse {
  success: boolean;
  message: string;
  data: any;
  statusCode: number;
}

export interface UserAuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string | null;
    emailVerified: boolean;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
  };
}
