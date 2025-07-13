import { Request } from "express";

/**
 * Extended Express Request object that includes a decoded user ID.
 */
export interface AuthRequest extends Request {
  /** Authenticated user's ID */
  user?: { id: number };
}

/**
 * Represents the expected body of a user registration request.
 */
export interface RegisterRequestBody {
  /** User's username */
  username: string;
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Represents the expected body of a user login request.
 */
export interface LoginRequestBody {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}
