import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../index.js";
import * as apiClient from "../utils/apiClient.js";

// Mock the API client to prevent actual API calls during tests
vi.mock("../utils/apiClient.js");

describe("Express App Routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("GET /", () => {
		it("should return home page with 200 status", async () => {
			const response = await request(app).get("/");
			expect(response.status).toBe(200);
		});

		it("should contain Kainos in the response", async () => {
			const response = await request(app).get("/");
			expect(response.text).toContain("Kainos");
		});
	});

	describe("GET /jobs", () => {
		it("should return jobs page with 200 status", async () => {
			const response = await request(app).get("/jobs");
			expect(response.status).toBe(200);
		});

		it("should display job listings", async () => {
			const response = await request(app).get("/jobs");
			expect(response.text).toContain("job");
		});
	});

	describe("GET /job-roles/:id", () => {
		it("should return job detail page for valid ID", async () => {
			const response = await request(app).get("/job-roles/1");
			expect(response.status).toBe(200);
		});

		it("should redirect to error page for invalid job ID", async () => {
			const response = await request(app).get("/job-roles/999");
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe("/error");
		});

		it("should redirect to error page for non-numeric ID", async () => {
			const response = await request(app).get("/job-roles/abc");
			expect(response.status).toBe(302);
			expect(response.headers.location).toBe("/error");
		});
	});

	describe("GET /login", () => {
		it("should return login page with 200 status", async () => {
			const response = await request(app).get("/login");
			expect(response.status).toBe(200);
		});

		it("should contain login form elements", async () => {
			const response = await request(app).get("/login");
			expect(response.text).toContain("Login");
			expect(response.text).toContain("email");
			expect(response.text).toContain("password");
		});

		it("should have Sign In button", async () => {
			const response = await request(app).get("/login");
			expect(response.text).toContain("Sign In");
		});

		it("should include login form with id loginForm", async () => {
			const response = await request(app).get("/login");
			expect(response.text).toContain('id="loginForm"');
		});

		it("should set correct page title", async () => {
			const response = await request(app).get("/login");
			expect(response.text).toContain("Login - Kainos");
		});
	});

	describe("GET /register", () => {
		it("should return register page with 200 status", async () => {
			const response = await request(app).get("/register");
			expect(response.status).toBe(200);
		});

		it("should contain registration form elements", async () => {
			const response = await request(app).get("/register");
			expect(response.text).toContain("Register");
			expect(response.text).toContain("email");
			expect(response.text).toContain("password");
		});

		it("should have password confirmation field", async () => {
			const response = await request(app).get("/register");
			expect(response.text).toContain("confirmPassword");
		});

		it("should have Create Account button", async () => {
			const response = await request(app).get("/register");
			expect(response.text).toContain("Create Account");
		});

		it("should include registration form with id registerForm", async () => {
			const response = await request(app).get("/register");
			expect(response.text).toContain('id="registerForm"');
		});

		it("should have terms and conditions checkbox", async () => {
			const response = await request(app).get("/register");
			expect(response.text).toContain('id="terms"');
		});

		it("should set correct page title", async () => {
			const response = await request(app).get("/register");
			expect(response.text).toContain("Register - Kainos");
		});
	});

	describe("Error Pages", () => {
		describe("GET /error", () => {
			it("should return error page with 500 status", async () => {
				const response = await request(app).get("/error");
				expect(response.status).toBe(500);
			});

			it("should contain error message", async () => {
				const response = await request(app).get("/error");
				expect(response.text).toContain("Something Went Wrong");
			});

			it("should have Go Back button", async () => {
				const response = await request(app).get("/error");
				expect(response.text).toContain("Go Back");
			});
		});

		describe("GET /login-failed", () => {
			it("should return login failed page with 401 status", async () => {
				const response = await request(app).get("/login-failed");
				expect(response.status).toBe(401);
			});

			it("should contain login failed message", async () => {
				const response = await request(app).get("/login-failed");
				expect(response.text).toContain("Login Failed");
			});

			it("should have Try Again button", async () => {
				const response = await request(app).get("/login-failed");
				expect(response.text).toContain("Try Again");
			});
		});

		describe("GET /register-failed", () => {
			it("should return register failed page with 400 status", async () => {
				const response = await request(app).get("/register-failed");
				expect(response.status).toBe(400);
			});

			it("should contain registration failed message", async () => {
				const response = await request(app).get("/register-failed");
				expect(response.text).toContain("Registration Failed");
			});

			it("should have Try Again button", async () => {
				const response = await request(app).get("/register-failed");
				expect(response.text).toContain("Try Again");
			});
		});
	});

	describe("API Routes", () => {
		describe("POST /api/login", () => {
			it("should redirect to login-failed when email is missing", async () => {
				const response = await request(app)
					.post("/api/login")
					.send({ password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/login-failed");
			});

			it("should redirect to login-failed when password is missing", async () => {
				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/login-failed");
			});

			it("should set HTTP-only cookie and redirect on successful login", async () => {
				vi.mocked(apiClient.loginUser).mockResolvedValue({
					success: true,
					data: { token: "test-jwt-token" },
				});

				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com", password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.redirectUrl).toBe("/jobs");
				expect(response.headers["set-cookie"]).toBeDefined();
				expect(response.headers["set-cookie"][0]).toContain("authToken");
				expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
			});

			it("should redirect to login-failed on API error", async () => {
				vi.mocked(apiClient.loginUser).mockResolvedValue({
					success: false,
					error: "Invalid credentials",
					status: 401,
				});

				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com", password: "wrongpassword" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/login-failed");
			});

			it("should redirect to error page on exception", async () => {
				vi.mocked(apiClient.loginUser).mockRejectedValue(
					new Error("Network error"),
				);

				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com", password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/error");
			});
		});

		describe("POST /api/register", () => {
			it("should redirect to register-failed when email is missing", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({ password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/register-failed");
			});

			it("should redirect to register-failed when password is missing", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({ email: "test@example.com" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/register-failed");
			});

			it("should set HTTP-only cookie and redirect on successful registration", async () => {
				vi.mocked(apiClient.registerUser).mockResolvedValue({
					success: true,
					data: { token: "test-jwt-token" },
				});

				const response = await request(app)
					.post("/api/register")
					.send({ email: "newuser@example.com", password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.redirectUrl).toBe("/jobs");
				expect(response.headers["set-cookie"]).toBeDefined();
				expect(response.headers["set-cookie"][0]).toContain("authToken");
				expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
			});

			it("should redirect to register-failed on API error", async () => {
				vi.mocked(apiClient.registerUser).mockResolvedValue({
					success: false,
					error: "Email already exists",
					status: 400,
				});

				const response = await request(app)
					.post("/api/register")
					.send({ email: "existing@example.com", password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/register-failed");
			});

			it("should redirect to error page on exception", async () => {
				vi.mocked(apiClient.registerUser).mockRejectedValue(
					new Error("Database error"),
				);

				const response = await request(app)
					.post("/api/register")
					.send({ email: "test@example.com", password: "password123" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.redirectUrl).toBe("/error");
			});
		});

		describe("POST /api/logout", () => {
			it("should clear auth cookie and redirect to home", async () => {
				const response = await request(app)
					.post("/api/logout")
					.set("Cookie", ["authToken=test-token"]);

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.redirectUrl).toBe("/");
				expect(response.headers["set-cookie"]).toBeDefined();
				expect(response.headers["set-cookie"][0]).toContain("authToken=;");
			});
		});

		describe("GET /api/auth-status", () => {
			it("should return authenticated true when cookie is present", async () => {
				const response = await request(app)
					.get("/api/auth-status")
					.set("Cookie", ["authToken=test-token"]);

				expect(response.status).toBe(200);
				expect(response.body.isAuthenticated).toBe(true);
			});

			it("should return authenticated false when cookie is missing", async () => {
				const response = await request(app).get("/api/auth-status");

				expect(response.status).toBe(200);
				expect(response.body.isAuthenticated).toBe(false);
			});
		});
	});
});
