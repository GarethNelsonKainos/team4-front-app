import type { NextFunction, Request, Response } from "express";
import * as yup from "yup";
import { loginSchema, registrationSchema } from "../schemas/validationSchemas";
import { loginUser, registerUser } from "../utils/apiClient";
import type { AuthRequest } from "../utils/auth";
import { clearAuthCookie, setAuthCookie } from "../utils/auth";

/**
 * Handle user login
 */
export async function login(req: Request, res: Response, _next: NextFunction) {
	const authReq = req as AuthRequest;

	try {
		const validated = await loginSchema.validate(req.body, {
			abortEarly: false,
		});

		// Call backend API through server-side client
		const result = await loginUser(validated.email, validated.password);

		if (!result.success) {
			// Return error message and restore form
			console.error("Login failed:", result.error);

			return res.render("pages/login.njk", {
				title: "Login - Kainos",
				currentPage: "login",
				user: authReq.user,
				formData: { email: validated.email },
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
		if (error instanceof yup.ValidationError) {
			const errors: Record<string, string> = {};
			error.inner.forEach((err) => {
				if (err.path) errors[err.path] = err.message;
			});

			return res.render("pages/login.njk", {
				title: "Login - Kainos",
				currentPage: "login",
				user: authReq.user,
				formData: { email: req.body.email || "" },
				errors,
				errorMessage: "Please correct the errors",
			});
		}

		// Handle any other unexpected errors
		console.error("Unexpected login error:", error);
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
	const authReq = req as AuthRequest;

	try {
		const validated = await registrationSchema.validate(req.body, {
			abortEarly: false,
		});

		const result = await registerUser(validated.email, validated.password);
		if (!result.success) {
			// Return error message and restore form
			console.error("Registration failed:", result.error);
			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email: validated.email },
				errorMessage: "Error registering.",
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
		if (error instanceof yup.ValidationError) {
			const errors: Record<string, string> = {};
			error.inner.forEach((err) => {
				if (err.path) errors[err.path] = err.message;
			});
			return res.render("pages/register.njk", {
				title: "Register - Kainos",
				currentPage: "register",
				user: authReq.user,
				formData: { email: req.body.email || "" },
				errors,
				errorMessage: "Please correct the errors",
			});
		}

		// Handle any other unexpected errors
		console.error("Unexpected registration error:", error);
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
