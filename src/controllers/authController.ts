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
			// Return error message for better UX - don't redirect
			return res.redirect("/login?error=missing_credentials");
		}

		// Call backend API through server-side client
		const result = await loginUser(email, password);

		if (!result.success) {
			// Return error message instead of redirecting
			console.error("Login failed:", result.error);
			return res.redirect("/login?error=invalid_credentials");
		}

		// Set secure HTTP-only cookie with the token
		// This prevents XSS attacks - token is not accessible to JavaScript
		setAuthCookie(result.data.token, res);

		// Return success response with redirect URL for client-side handling
		return res.redirect("/jobs");
	} catch (error) {
		// Production: log error privately, return generic error message to user
		console.error("Login error:", error);
		return res.redirect("/login?error=server_error");
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
		const { email, password, confirmPassword } = req.body;

		// Validate required fields
		if (!email || !password || !confirmPassword) {
			// Return error message for better UX - don't redirect
			return res.redirect("/register?error=missing_fields");
		}

		// Validate passwords match
		if (password !== confirmPassword) {
			return res.redirect("/register?error=passwords_mismatch");
		}

		// Validate password strength
		if (password.length < 6) {
			return res.redirect("/register?error=password_too_short");
		}

		// Password must contain a number AND special character
		const hasNumber = /[0-9]/.test(password);
		const hasSpecialChar = /[!@#$%^&*]/.test(password);
		if (!hasNumber || !hasSpecialChar) {
			return res.redirect("/register?error=password_invalid_format");
		}

		// Call backend API through server-side client
		const result = await registerUser(email, password);

		if (!result.success) {
			// Return error message instead of redirecting
			console.error("Registration failed:", result.error);
			return res.redirect("/register?error=registration_failed");
		}

		// Set secure HTTP-only cookie with the token if provided
		if (result.data.token) {
			setAuthCookie(result.data.token, res);
			return res.redirect("/jobs");
		} else {
			return res.redirect("/login");
		}
	} catch (error) {
		// Production: log error privately, return generic error message to user
		console.error("Registration error:", error);
		return res.redirect("/register?error=server_error");
	}
}

/**
 * Handle user logout
 */
export function logout(_req: Request, res: Response, _next: NextFunction) {
	try {
		clearAuthCookie(res);
		return res.redirect("/");
	} catch (error) {
		// Production: log error privately, return error response
		console.error("Logout error:", error);
		return res.redirect("/error");
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
