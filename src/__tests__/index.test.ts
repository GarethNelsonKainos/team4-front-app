import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../index.js";

describe("Express App Routes", () => {
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

		it("should return 404 for invalid job ID", async () => {
			const response = await request(app).get("/job-roles/999");
			expect(response.status).toBe(404);
		});

		it("should return 404 for non-numeric ID", async () => {
			const response = await request(app).get("/job-roles/abc");
			expect(response.status).toBe(404);
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
});
