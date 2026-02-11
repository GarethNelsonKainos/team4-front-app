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
});
