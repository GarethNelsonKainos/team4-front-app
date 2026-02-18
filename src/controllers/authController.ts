import type { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../utils/apiClient";
import type { AuthRequest } from "../utils/auth";
import { clearAuthCookie, setAuthCookie } from "../utils/auth";

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password: string): {
	valid: boolean;
	error?: string;
} {
	if (!password) {
		return { valid: false, error: "Password is required." };
	}

	if (password.length < 6) {
		return { valid: false, error: "Password must be at least 6 characters." };
	}

	const hasNumber = /[0-9]/.test(password);
	const hasSpecialChar = /[!@#$%^&*]/.test(password);

	if (!hasNumber || !hasSpecialChar) {
		return {
			valid: false,
			error:
				"Password must include a number and a special character (!@#$%^&*).",
		};
	}

	return { valid: true };
}

/**
 * Handle user login
 */
export async function login(req: Request, res: Response, _next: NextFunction) {
	try {
		const { email, password } = req.body;
		const authReq = req as AuthRequest;

		// Validate input - redirect with error if validation fails
		if (!email || !password) {
			return res.redirect("/login?error=missing_credentials");
		}

		if (!isValidEmail(email)) {
			const errors: Record<string, string> = {};
			errors.email = "Enter a valid email address.";

			return res.render("pages/login.njk", {
				title: "Login - Kainos",
				currentPage: "login",
				user: authReq.user,
				formData: { email },
				errors,
				errorMessage: "Please correct the errors below.",
			});
		}

		// Call backend API through server-side client
		const result = await loginUser(email, password);

		if (!result.success) {
			// Return error message and restore form
			console.error("Login failed:", result.error);

			return res.render("pages/login.njk", {
				title: "Login - Kainos",
				currentPage: "login",
				user: authReq.user,
				formData: { email },
				errorMessage: "Invalid email or password. Please try again.",
			});
		}

		// Set secure HTTP-only cookie with the token
		// This prevents XSS attacks - token is not accessible to JavaScript
		setAuthCookie(result.data.token, res);

		// Redirect on success
		return res.redirect("/jobs");
	} catch (error) {
		// Production: log error privately, return generic error message to user
		console.error("Login error:", error);
		const authReq = req as AuthRequest;

		return res.render("pages/login.njk", {
			title: "Login - Kainos",
			currentPage: "login",
			user: authReq.user,
			formData: { email: req.body.email || "" },
			errorMessage: "A server error occurred. Please try again later.",
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
		const authReq = req as AuthRequest;

		const errors: Record<string, string> = {};

		// Validate required fields
		if (!email || !password || !confirmPassword) {
			if (!email) errors.email = "Email is required.";
			if (!password) errors.password = "Password is required.";
			if (!confirmPassword)
				errors.confirmPassword = "Please confirm your password.";

			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email: email || "" },
				errors,
				errorMessage: "Please fill in all required fields.",
			});
		}

		// Validate email format
		if (!isValidEmail(email)) {
			errors.email = "Enter a valid email address.";

			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email },
				errors,
				errorMessage: "Please correct the errors below.",
			});
		}

		// Validate passwords match
		if (password !== confirmPassword) {
			errors.confirmPassword = "Passwords do not match.";

			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email },
				errors,
				errorMessage: "Please correct the errors below.",
			});
		}

		// Validate password strength
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			errors.password = passwordValidation.error || "Invalid password.";

			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email },
				errors,
				errorMessage: "Please correct the errors below.",
			});
		}

		// Call backend API through server-side client
		const result = await registerUser(email, password);

		if (!result.success) {
			// Return error message and restore form
			console.error("Registration failed:", result.error);

			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email },
				errorMessage:
					"Registration failed. This email may already be in use. Please try another email.",
			});
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
		const authReq = req as AuthRequest;

		return res.render("pages/register.njk", {
			title: "Register - Kainos",
			currentPage: "register",
			user: authReq.user,
			formData: { email: req.body.email || "" },
			errorMessage: "A server error occurred. Please try again later.",
		});
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
