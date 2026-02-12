import type { NextFunction, Request, Response } from "express";

/**
 * Extended Request interface with authentication token
 */
export interface AuthRequest extends Request {
	authToken?: string;
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
 * Middleware to check if user is authenticated
 * Verifies the presence of authToken cookie
 */
export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const token = req.cookies.authToken;

	if (!token) {
		return res.redirect("/login");
	}

	// Store token in request for use in route handlers
	(req as AuthRequest).authToken = token;
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
