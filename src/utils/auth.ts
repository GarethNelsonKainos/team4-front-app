import type { NextFunction, Request, Response } from "express";
import { getUserEmail, getUserRole, isTokenExpired } from "./jwtDecoder";

/**
 * Extended Request interface with authentication token and user info
 */
export interface AuthRequest extends Request {
	authToken?: string;
	user?: {
		email: string | null;
		role: "admin" | "applicant" | null;
		isAuthenticated: boolean;
	};
}

/**
 * Middleware to set secure HTTP-only cookie with token
 * This prevents XSS attacks by making the token inaccessible to JavaScript
 */
export function setAuthCookie(token: string, res: Response) {
	res.cookie("authToken", token, {
		httpOnly: true, // Prevents JavaScript from accessing the token
		secure: process.env.NODE_ENV === "production", // Only HTTPS in production
		sameSite: "strict", // CSRF protection
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	});
}

/**
 * Middleware to check if user is authenticated and extract user info
 * Verifies the presence of authToken cookie and decodes it
 */
export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const token = req.cookies.authToken;

	if (!token) {
		// Set empty user info for unauthenticated requests
		(req as AuthRequest).user = {
			email: null,
			role: null,
			isAuthenticated: false,
		};
		return next();
	}

	// Check if token is expired
	if (isTokenExpired(token)) {
		clearAuthCookie(res);
		(req as AuthRequest).user = {
			email: null,
			role: null,
			isAuthenticated: false,
		};
		return next();
	}

	// Store token and extracted user info in request
	(req as AuthRequest).authToken = token;
	(req as AuthRequest).user = {
		email: getUserEmail(token),
		role: getUserRole(token),
		isAuthenticated: true,
	};

	next();
}

/**
 * Middleware to require authentication
 * Redirects to login if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authReq = req as AuthRequest;
	if (!authReq.user?.isAuthenticated) {
		return res.redirect("/login");
	}
	next();
}

/**
 * Middleware to require admin role
 * Redirects to error page if not admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	const authReq = req as AuthRequest;
	if (!authReq.user?.isAuthenticated || authReq.user?.role !== "admin") {
		return res.redirect("/error");
	}
	next();
}

/**
 * Utility to clear authentication cookie
 */
export function clearAuthCookie(res: Response) {
	res.clearCookie("authToken", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
}
