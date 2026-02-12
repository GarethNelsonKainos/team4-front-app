import type { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../utils/apiClient";
import { clearAuthCookie, setAuthCookie } from "../utils/auth";

/**
 * Handle user login
 */
export async function login(req: Request, res: Response, _next: NextFunction) {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			// Production: redirect to login failed page instead of exposing validation details
			return res.json({
				success: false,
				redirectUrl: "/login-failed",
			});
		}

		// Call backend API through server-side client
		const result = await loginUser(email, password);

		if (!result.success) {
			// Production: redirect to error page instead of exposing API errors
			console.error("Login failed:", result.error);
			return res.json({
				success: false,
				redirectUrl: "/login-failed",
			});
		}

		// Set secure HTTP-only cookie with the token
		// This prevents XSS attacks - token is not accessible to JavaScript
		setAuthCookie(result.data.token, res);

		// Redirect to jobs page on successful login
		res.json({
			success: true,
			redirectUrl: "/jobs",
		});
	} catch (error) {
		// Production: log error privately, show generic error page to user
		console.error("Login error:", error);
		res.json({
			success: false,
			redirectUrl: "/error",
		});
	}
}

/**
 * Handle user registration
 */
export async function register(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const { email, password } = req.body;

		// Validate required fields
		if (!email || !password) {
			// Production: redirect to register failed page instead of exposing validation details
			return res.json({
				success: false,
				redirectUrl: "/register-failed",
			});
		}

		// Call backend API through server-side client
		const result = await registerUser(email, password);

		if (!result.success) {
			// Production: redirect to error page instead of exposing API errors
			console.error("Registration failed:", result.error);
			return res.json({
				success: false,
				redirectUrl: "/register-failed",
			});
		}

		// Set secure HTTP-only cookie with the token if provided
		if (result.data.token) {
			setAuthCookie(result.data.token, res);
		}

		res.json({
			success: true,
			redirectUrl: result.data.token ? "/jobs" : "/login",
		});
	} catch (error) {
		// Production: log error privately, show generic error page to user
		console.error("Registration error:", error);
		res.json({
			success: false,
			redirectUrl: "/error",
		});
	}
}

/**
 * Handle user logout
 */
export function logout(_req: Request, res: Response, _next: NextFunction) {
	try {
		clearAuthCookie(res);
		res.json({ success: true, redirectUrl: "/" });
	} catch (error) {
		// Production: log error privately, show generic error page to user
		console.error("Logout error:", error);
		res.json({
			success: false,
			redirectUrl: "/error",
		});
	}
}

/**
 * Check authentication status
 */
export function checkAuthStatus(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	const token = req.cookies.authToken;
	const isAuthenticated = !!token;

	res.json({
		isAuthenticated,
		// Note: If you need to return user email, would need to decode JWT or store user info in session
	});
}
