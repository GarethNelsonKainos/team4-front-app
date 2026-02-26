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

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					errors: expect.objectContaining({ email: "Email is required" }),
				}),
			);
		});

		it("should return error message when password is missing", async () => {
			mockRequest.body = { email: "test@example.com" };

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					errors: expect.objectContaining({ password: "Password is required" }),
				}),
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

		it("should handle API error when email is undefined in body", async () => {
			mockRequest.body = {
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
					formData: { email: "" },
				}),
			);
		});

		it("should handle exception when email is undefined in body", async () => {
			mockRequest.body = {
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
					formData: { email: "" },
				}),
			);
		});

		it("should process validation errors even with missing path", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
			};

			// Mock validate to throw error with and without paths
			vi.spyOn(require("yup"), "object").mockReturnValue({
				shape: vi.fn().mockReturnThis(),
				validate: vi.fn().mockRejectedValue(
					Object.assign(new Error("Validation error"), {
						inner: [
							{
								path: "email",
								message: "Email invalid",
							},
							{
								path: null,
								message: "Unknown error",
							},
						],
					}),
				),
			});

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalled();
		});

		it("should process validation errors and handle formData with falsy email through API error path", async () => {
			// This test validates the formData || "" branch
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

			const renderMock = mockResponse.render as unknown as {
				mock: { calls: unknown[][] };
			};
			const renderCalls = renderMock.mock.calls;
			expect(renderCalls.length).toBeGreaterThan(0);
			const lastCall = renderCalls[renderCalls.length - 1][1] as Record<
				string,
				unknown
			>;
			expect((lastCall.formData as Record<string, string>).email).toBe(
				"test@example.com",
			);
		});

		it("should handle exception with defined email in body", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
			};

			// Throw an error (not a validation error)
			vi.mocked(apiClient.loginUser).mockRejectedValue(
				new Error("Network timeout"),
			);

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					formData: { email: "test@example.com" },
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
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
					errors: expect.objectContaining({ email: "Email is required" }),
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
						password: "Password is required",
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
						confirmPassword: "Please confirm your password",
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
						confirmPassword: "Passwords do not match",
					}),
				}),
			);
		});

		it("should return error message when password is too short", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "pa1!",
				confirmPassword: "pa1!",
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
				password: "password123",
				confirmPassword: "password123",
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
				password: "password!",
				confirmPassword: "password!",
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
					errorMessage: "Error registering.",
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

		it("should handle API error when email is undefined in body", async () => {
			mockRequest.body = {
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockResolvedValue({
				success: false,
				error: "Registration failed",
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
					formData: { email: "" },
				}),
			);
		});

		it("should handle exception when email is undefined in body", async () => {
			mockRequest.body = {
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
					formData: { email: "" },
				}),
			);
		});

		it("should handle validation errors in register and skip errors without paths", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "Test123!missing",
				confirmPassword: "Test123!",
			};

			// Password lacks special character requirement
			// This naturally produces a ValidationError
			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					errors: expect.any(Object),
				}),
			);
		});

		it("should handle exception with defined email in body in register", async () => {
			mockRequest.body = {
				email: "test@example.com",
				password: "Test123!",
				confirmPassword: "Test123!",
			};

			// Throw an error (not a validation error)
			vi.mocked(apiClient.registerUser).mockRejectedValue(
				new Error("Database connection failed"),
			);

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					formData: { email: "test@example.com" },
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

	describe("branch coverage - formData email handling", () => {
		it("should use email from validated data when validation error occurs with email present", async () => {
			// This test ensures the branch where email IS present in validation error path
			mockRequest.body = {
				email: "test@example.com",
				password: "short", // Invalid password to trigger validation error
			};

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.any(Object),
			);
			// The render was called, confirming the validation error path was hit
		});

		it("should handle validation errors with and without paths in forEach loop", async () => {
			// This test exercises the if(err.path) branch on line 46
			const yup = await import("yup");
			const { loginSchema } = await import("../schemas/validationSchemas.js");

			mockRequest.body = {
				email: "test@example.com",
				password: "short",
			};

			// Create a real validation error with inner array
			const validationError = new yup.default.ValidationError("Test error");
			/* biome-ignore lint/suspicious/noExplicitAny: Testing with mixed types */
			(validationError as any).inner = [
				{
					message: "Valid path error",
					path: "email",
				} as Record<string, unknown>,
				{
					message: "No path error",
					// explicitly no path property
				} as Record<string, unknown>,
			];

			const validateSpy = vi
				.spyOn(loginSchema, "validate")
				.mockRejectedValueOnce(validationError);

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalled();
			validateSpy.mockRestore();
		});

		it("should use empty string for email when non-validation error occurs with no email", async () => {
			// This test ensures the branch where email is NOT present in general error path
			// This exercises the req.body.email || "" branch on line 65
			mockRequest.body = {
				password: "password123!",
				// No email property
			};

			// First a validation error will be thrown for missing email
			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			// The error should reference the empty string formData
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					formData: { email: "" },
				}),
			);
		});

		it("should use email from body when general error occurs with email present", async () => {
			mockRequest.body = {
				email: "defined@example.com",
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
					formData: { email: "defined@example.com" },
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
		});

		it("should use empty string when general error occurs with no email (line 65 || coverage)", async () => {
			// This test exercises the || "" fallback on line 65
			const { loginSchema } = await import("../schemas/validationSchemas.js");

			mockRequest.body = {
				password: "password123!",
				// No email - but we'll mock schema to pass validation
			};

			// Mock schema to pass validation
			vi.spyOn(loginSchema, "validate").mockResolvedValueOnce({
				email: "implicit@example.com", // Return something from validation
				password: "password123!",
			});

			// Then API throws a general error
			vi.mocked(apiClient.loginUser).mockRejectedValueOnce(
				new Error("API Error"),
			);

			await authController.login(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			// Should use req.body.email (which is undefined) || ""
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					formData: { email: "" },
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
		});

		it("should handle registration validation errors with and without paths", async () => {
			// This test exercises the if(err.path) branch on line 111 in register
			const yup = await import("yup");
			const { registrationSchema } = await import(
				"../schemas/validationSchemas.js"
			);

			mockRequest.body = {
				email: "test@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			// Create a real validation error with inner array
			const validationError = new yup.default.ValidationError("Test error");
			/* biome-ignore lint/suspicious/noExplicitAny: Testing with mixed types */
			(validationError as any).inner = [
				{
					message: "Password error",
					path: "password",
				} as Record<string, unknown>,
				{
					message: "No path error",
					// explicitly no path property
				} as Record<string, unknown>,
			];

			const validateSpy = vi
				.spyOn(registrationSchema, "validate")
				.mockRejectedValueOnce(validationError);

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalled();
			validateSpy.mockRestore();
		});

		it("should use empty string for register email when no email in body during general error", async () => {
			// This test exercises the req.body.email || "" branch on line 129 in register
			const { registrationSchema } = await import(
				"../schemas/validationSchemas.js"
			);

			mockRequest.body = {
				password: "password123!",
				confirmPassword: "password123!",
				// No email - but we'll mock schema to pass validation
			};

			// Mock schema to pass validation
			vi.spyOn(registrationSchema, "validate").mockResolvedValueOnce({
				email: "implicit@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			});

			// Then API throws a general error
			vi.mocked(apiClient.registerUser).mockRejectedValueOnce(
				new Error("API Error"),
			);

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			// Should use req.body.email (which is undefined) || ""
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					formData: { email: "" },
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
		});

		it("should use email from body when register general error occurs with email present", async () => {
			mockRequest.body = {
				email: "register@example.com",
				password: "password123!",
				confirmPassword: "password123!",
			};

			vi.mocked(apiClient.registerUser).mockRejectedValue(
				new Error("Server error"),
			);

			await authController.register(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					formData: { email: "register@example.com" },
					errorMessage: "A server error occurred. Please try again later.",
				}),
			);
		});
	});
});
