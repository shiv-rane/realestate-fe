export type UserRole = 'OWNER' | 'AGENT' | 'ADMIN';

export interface SendOtpRequest {
  name: string;
  email: string;
  role: 'OWNER' | 'AGENT' | 'ADMIN';
}

export interface SendOtpResponse {
  message: string;
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  tokenType?: string;
  expiresInMs?: number;
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'AGENT' | 'ADMIN';
  token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: any;
    lastLogin: string;
  };
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'AGENT' | 'ADMIN';
  loginTimestamp: number;
}
