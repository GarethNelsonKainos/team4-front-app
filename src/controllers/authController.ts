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
			return res.json({
				success: false,
				message: "Please enter your email and password",
			});
		}

		// Call backend API through server-side client
		const result = await loginUser(email, password);

		if (!result.success) {
			// Return error message instead of redirecting
			console.error("Login failed:", result.error);
			return res.json({
				success: false,
				message: "Invalid email or password",
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
		// Production: log error privately, return generic error message to user
		console.error("Login error:", error);
		res.json({
			success: false,
			message: "An error occurred. Please try again later",
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
		const { email, password, confirmPassword } = req.body;

		// Validate required fields
		if (!email || !password || !confirmPassword) {
			// Return error message for better UX - don't redirect
			return res.json({
				success: false,
				message: "Please fill in all required fields",
			});
		}

		// Validate passwords match
		if (password !== confirmPassword) {
			return res.json({
				success: false,
				message: "Passwords do not match",
			});
		}

		// Validate password strength
		if (password.length < 6) {
			return res.json({
				success: false,
				message: "Password must be at least 6 characters",
			});
		}

		// Password must contain a number AND special character
		const hasNumber = /[0-9]/.test(password);
		const hasSpecialChar = /[!@#$%^&*]/.test(password);
		if (!hasNumber || !hasSpecialChar) {
			return res.json({
				success: false,
				message:
					"Password must include a number (0-9) and special character (!@#$%^&*)",
			});
		}

		// Call backend API through server-side client
		const result = await registerUser(email, password);

		if (!result.success) {
			// Return error message instead of redirecting
			console.error("Registration failed:", result.error);
			return res.json({
				success: false,
				message: "Registration failed. Email may already be in use",
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
		// Production: log error privately, return generic error message to user
		console.error("Registration error:", error);
		res.json({
			success: false,
			message: "An error occurred. Please try again later",
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
