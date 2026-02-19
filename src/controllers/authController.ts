import type { NextFunction, Request, Response } from "express";
import { loginUser, registerUser, uploadCVToBackend } from "../utils/apiClient";
import { clearAuthCookie, setAuthCookie } from "../utils/auth";
import multer, { type FileFilterCallback } from "multer";

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'));
		}
	}
});

/**
 * Handle CV upload
 */
export const uploadCVMiddleware = upload.single('cv');

/**
 * Handle CV upload controller
 */
export async function uploadCV(req: Request & { file?: Express.Multer.File }, res: Response, _next: NextFunction) {
	try {
		const { jobRoleId } = req.body;
		const file = req.file;

		// Validate required fields
		if (!jobRoleId) {
			return res.status(400).json({
				success: false,
				error: 'Job role ID is required'
			});
		}

		if (!file) {
			return res.status(400).json({
				success: false,
				error: 'CV file is required'
			});
		}

		// Get token from cookies for authentication
		const token = req.cookies.authToken;
		if (!token) {
			return res.status(401).json({
				success: false,
				error: 'Authentication required'
			});
		}

		// Forward to backend API
		const result = await uploadCVToBackend(
			file.buffer, 
			file.originalname, 
			file.mimetype, 
			jobRoleId, 
			token
		);

		// Return backend response with appropriate status code
		return res.status(result.success ? 200 : (result.status || 500)).json(result);
	} catch (error) {
		console.error('CV upload error:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error during CV upload'
		});
	}
}

/**
 * Handle user login
 */
export async function login(req: Request, res: Response, _next: NextFunction) {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			// Return error message for better UX - don't redirect
			return res.redirect("/login");
		}

		// Call backend API through server-side client
		const result = await loginUser(email, password);

		if (!result.success) {
			// Return error message instead of redirecting
			console.error("Login failed:", result.error);
			return res.redirect("/login");
		}

		// Set secure HTTP-only cookie with the token
		// This prevents XSS attacks - token is not accessible to JavaScript
		setAuthCookie(result.data.token, res);

		// Return success response with redirect URL for client-side handling
		return res.redirect("/jobs");
	} catch (error) {
		// Production: log error privately, return generic error message to user
		console.error("Login error:", error);
		return res.redirect("/login");
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
			return res.redirect("/register");
		}

		// Validate passwords match
		if (password !== confirmPassword) {
			return res.redirect("/register");
		}

		// Validate password strength
		if (password.length < 6) {
			return res.redirect("/register");
		}

		// Password must contain a number AND special character
		const hasNumber = /[0-9]/.test(password);
		const hasSpecialChar = /[!@#$%^&*]/.test(password);
		if (!hasNumber || !hasSpecialChar) {
			return res.redirect("/register");
		}

		// Call backend API through server-side client
		const result = await registerUser(email, password);

		if (!result.success) {
			// Return error message instead of redirecting
			console.error("Registration failed:", result.error);
			return res.redirect("/register");
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
		return res.redirect("/login");
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
