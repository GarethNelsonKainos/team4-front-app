import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jobRoles } from "../data/mockData.js";
import { app } from "../index.js";
import * as apiClient from "../utils/apiClient.js";

// Mock the API client to prevent actual API calls during tests
vi.mock("../utils/apiClient.js");

describe("Express App Routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup the mock for getJobRolesPublic
		vi.mocked(apiClient.getJobRolesPublic).mockResolvedValue({
			success: true,
			data: jobRoles.map((job) => ({
				...job,
				jobRoleId: job.id,
			})),
		});

		// Setup the mock for getJobRole (single job detail endpoint)
		vi.mocked(apiClient.getJobRole).mockImplementation(async (id: number) => {
			const job = jobRoles.find((j) => j.id === id);
			if (!job) {
				return { success: false, error: "Job role not found", status: 404 };
			}
			return {
				success: true,
				data: { ...job, jobRoleId: job.id },
			};
		});
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
	});

	describe("API Routes", () => {
		describe("POST /api/login", () => {
			it("should return error message when email is missing", async () => {
				const response = await request(app)
					.post("/api/login")
					.send({ password: "password123!" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Please enter your email and password",
				);
			});

			it("should return error message when password is missing", async () => {
				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Please enter your email and password",
				);
			});

			it("should set HTTP-only cookie and redirect on successful login", async () => {
				vi.mocked(apiClient.loginUser).mockResolvedValue({
					success: true,
					data: { token: "test-jwt-token" },
				});

				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com", password: "password123!" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.redirectUrl).toBe("/jobs");
				expect(response.headers["set-cookie"]).toBeDefined();
				expect(response.headers["set-cookie"][0]).toContain("authToken");
				expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
			});

			it("should return error message on API error", async () => {
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
				expect(response.body.message).toBe("Invalid email or password");
			});

			it("should return generic error message on exception", async () => {
				vi.mocked(apiClient.loginUser).mockRejectedValue(
					new Error("Network error"),
				);

				const response = await request(app)
					.post("/api/login")
					.send({ email: "test@example.com", password: "password123!" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"An error occurred. Please try again later",
				);
			});
		});

		describe("POST /api/register", () => {
			it("should return error message when email is missing", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({ password: "password123!", confirmPassword: "password123!" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Please fill in all required fields",
				);
			});

			it("should return error message when password is missing", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({ email: "test@example.com", confirmPassword: "password123!" })
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Please fill in all required fields",
				);
			});

			it("should return error message when passwords do not match", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({
						email: "test@example.com",
						password: "password123!",
						confirmPassword: "password456",
					})
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe("Passwords do not match");
			});
			it("should return error message when password is too short", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({
						email: "test@example.com",
						password: "pass1",
						confirmPassword: "pass1",
					})
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Password must be at least 6 characters",
				);
			});

			it("should return error message when password lacks number and special character", async () => {
				const response = await request(app)
					.post("/api/register")
					.send({
						email: "test@example.com",
						password: "password",
						confirmPassword: "password",
					})
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Password must include a number (0-9) and special character (!@#$%^&*)",
				);
			});
			it("should set HTTP-only cookie and redirect on successful registration", async () => {
				vi.mocked(apiClient.registerUser).mockResolvedValue({
					success: true,
					data: { token: "test-jwt-token" },
				});

				const response = await request(app)
					.post("/api/register")
					.send({
						email: "newuser@example.com",
						password: "password123!",
						confirmPassword: "password123!",
					})
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
				expect(response.body.redirectUrl).toBe("/jobs");
				expect(response.headers["set-cookie"]).toBeDefined();
				expect(response.headers["set-cookie"][0]).toContain("authToken");
				expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
			});

			it("should return error message on API error", async () => {
				vi.mocked(apiClient.registerUser).mockResolvedValue({
					success: false,
					error: "Email already exists",
					status: 400,
				});

				const response = await request(app)
					.post("/api/register")
					.send({
						email: "existing@example.com",
						password: "password123!",
						confirmPassword: "password123!",
					})
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"Registration failed. Email may already be in use",
				);
			});

			it("should return generic error message on exception", async () => {
				vi.mocked(apiClient.registerUser).mockRejectedValue(
					new Error("Database error"),
				);

				const response = await request(app)
					.post("/api/register")
					.send({
						email: "newuser@example.com",
						password: "password123!",
						confirmPassword: "password123!",
					})
					.set("Content-Type", "application/json");

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(false);
				expect(response.body.message).toBe(
					"An error occurred. Please try again later",
				);
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
