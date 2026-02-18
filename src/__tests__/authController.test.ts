import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authController from "../controllers/authController.js";
import * as apiClient from "../utils/apiClient.js";
import * as auth from "../utils/auth.js";

// Mock dependencies
vi.mock("../utils/apiClient.js");
vi.mock("../utils/auth.js");

describe("AuthController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			body: {},
			cookies: {},
		};
		mockResponse = {
			json: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			redirect: vi.fn().mockReturnThis(),
			render: vi.fn().mockReturnThis(),
		};
		mockNext = vi.fn();
		vi.clearAllMocks();
	});

	describe("login", () => {
		it("should return error message when email is missing", async () => {
			mockRequest.body = { password: "password123!" };

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith(
				"/login?error=missing_credentials",
			);
		});

		it("should return error message when password is missing", async () => {
			mockRequest.body = { email: "test@example.com" };

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith(
				"/login?error=missing_credentials",
			);
		});

		it("should set auth cookie and redirect to jobs on successful login", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
			};

			vi.mocked(apiClient.loginUser).mockResolvedValue({
				success: true,
				data: { token: "test-jwt-token" },
			});

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(apiClient.loginUser).toHaveBeenCalledWith(
				"test@example.com",
				"password123!",
			);
			expect(auth.setAuthCookie).toHaveBeenCalledWith(
				"test-jwt-token",
				mockResponse,
			);
			expect(mockResponse.redirect).toHaveBeenCalledWith("/jobs");
		});

		it("should return error message when API returns error", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "wrongpassword",
			};

			vi.mocked(apiClient.loginUser).mockResolvedValue({
				success: false,
				error: "Invalid credentials",
				status: 401,
			});

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					errorMessage: "Invalid email or password. Please try again.",
					formData: expect.objectContaining({ email: "test@example.com" }),
				}),
			);
		});

		it("should return generic error message on exception", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
			};

			vi.mocked(apiClient.loginUser).mockRejectedValue(
				new Error("Network error"),
			);

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
		});

		it("should log errors privately without exposing them to user", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
			};

			vi.mocked(apiClient.loginUser).mockResolvedValue({
				success: false,
				error: "Database connection failed",
				status: 500,
			});

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Login failed:",
				"Database connection failed",
			);
			consoleErrorSpy.mockRestore();
		});
	});

	describe("register", () => {
		it("should return error message when email is missing", async () => {
			mockRequest.body = {
				password: "password123!",
				confirmPassword: "password123!",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({ email: "Email is required." }),
				}),
			);
		});

		it("should return error message when password is missing", async () => {
			mockRequest.body = {
				email: "test@example.com",
				confirmPassword: "password123!",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({
						password: "Password is required.",
					}),
				}),
			);
		});

		it("should return error message when confirmPassword is missing", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({
						confirmPassword: "Please confirm your password.",
					}),
				}),
			);
		});

		it("should return error message when passwords do not match", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
				confirmPassword: "password456",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({
						confirmPassword: "Passwords do not match.",
					}),
				}),
			);
		});

		it("should return error message when password is too short", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "pass1",
				confirmPassword: "pass1",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({
						password: expect.stringContaining("at least 6 characters"),
					}),
				}),
			);
		});

		it("should return error message when password lacks a special character", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password",
				confirmPassword: "password",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({
						password: expect.stringContaining("special character"),
					}),
				}),
			);
		});

		it("should return error message when password lacks number", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password",
				confirmPassword: "password",
			};

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.objectContaining({
						password: expect.stringContaining("number"),
					}),
				}),
			);
		});

		it("should accept password with number and special character", async () => {
			mockRequest.body = {
				email: "newuser@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockResolvedValue({
				success: true,
				data: { token: "test-jwt-token" },
			});

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(apiClient.registerUser).toHaveBeenCalledWith(
				"newuser@example.com",
				"password123!",
			);
			expect(mockResponse.redirect).toHaveBeenCalledWith("/jobs");
		});

		it("should set auth cookie and redirect to jobs on successful registration", async () => {
			mockRequest.body = {
				email: "newuser@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockResolvedValue({
				success: true,
				data: { token: "test-jwt-token" },
			});

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(apiClient.registerUser).toHaveBeenCalledWith(
				"newuser@example.com",
				"password123!",
			);
			expect(auth.setAuthCookie).toHaveBeenCalledWith(
				"test-jwt-token",
				mockResponse,
			);
			expect(mockResponse.redirect).toHaveBeenCalledWith("/jobs");
		});

		it("should redirect to login if no token provided in response", async () => {
			mockRequest.body = {
				email: "newuser@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockResolvedValue({
				success: true,
				data: {},
			});

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(auth.setAuthCookie).not.toHaveBeenCalled();
			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should return error message when API returns error", async () => {
			mockRequest.body = {
				email: "existing@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockResolvedValue({
				success: false,
				error: "Email already exists",
				status: 400,
			});

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errorMessage:
						"Registration failed. This email may already be in use. Please try another email.",
					formData: expect.objectContaining({ email: "existing@example.com" }),
				}),
			);
		});

		it("should return generic error message on exception", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockRejectedValue(
				new Error("Database error"),
			);

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
		});
	});

	describe("logout", () => {
		it("should clear auth cookie and redirect to home", () => {
			authController.logout(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(auth.clearAuthCookie).toHaveBeenCalledWith(mockResponse);
			expect(mockResponse.redirect).toHaveBeenCalledWith("/");
		});

		it("should redirect to error page on exception", () => {
			vi.mocked(auth.clearAuthCookie).mockImplementation(() => {
				throw new Error("Cookie error");
			});

			authController.logout(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("checkAuthStatus", () => {
		it("should return authenticated true when cookie is present", () => {
			mockRequest.cookies = { authToken: "test-token" };

			authController.checkAuthStatus(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				isAuthenticated: true,
			});
		});

		it("should return authenticated false when cookie is missing", () => {
			mockRequest.cookies = {};

			authController.checkAuthStatus(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				isAuthenticated: false,
			});
		});

		it("should return authenticated false when cookie is null", () => {
			mockRequest.cookies = { authToken: null };

			authController.checkAuthStatus(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				isAuthenticated: false,
			});
		});

		it("should return authenticated false when cookie is undefined", () => {
			mockRequest.cookies = { authToken: undefined };

			authController.checkAuthStatus(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.json).toHaveBeenCalledWith({
				isAuthenticated: false,
			});
		});
	});
});
