import { describe, expect, it } from "vitest";
import {
	decodeToken,
	getUserEmail,
	getUserRole,
	isTokenExpired,
} from "../utils/jwtDecoder.js";

describe("JWT Decoder", () => {
	describe("decodeToken", () => {
		it("should successfully decode a valid JWT token", () => {
			const payload = {
				userEmail: "test@example.com",
				userRole: "admin",
				userId: 1,
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = decodeToken(token);

			expect(result).toEqual(payload);
		});

		it("should return null for token with invalid format (too few parts)", () => {
			const token = "invalid.token";

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should return null for token with invalid format (too many parts)", () => {
			const token = "part1.part2.part3.part4";

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should return null for token with invalid base64 encoding", () => {
			const token = "header.invalidbase64!@#$.signature";

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should return null for token with invalid JSON in payload", () => {
			const invalidJson = Buffer.from("{invalid json}").toString("base64");
			const token = `header.${invalidJson}.signature`;

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should decode token with exp and iat fields", () => {
			const payload = {
				userEmail: "test@example.com",
				userRole: "applicant",
				iat: 1234567890,
				exp: 1234571490,
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = decodeToken(token);

			expect(result).toEqual(payload);
			expect(result?.iat).toBe(1234567890);
			expect(result?.exp).toBe(1234571490);
		});
	});

	describe("getUserRole", () => {
		it("should extract admin role from token", () => {
			const payload = { userEmail: "admin@example.com", userRole: "admin" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("admin");
		});

		it("should extract applicant role from token", () => {
			const payload = { userEmail: "user@example.com", userRole: "applicant" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("applicant");
		});

		it("should normalize admin role to lowercase", () => {
			const payload = { userEmail: "admin@example.com", userRole: "Admin" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("admin");
		});

		it("should normalize applicant role to lowercase", () => {
			const payload = {
				userEmail: "user@example.com",
				userRole: "APPLICANT",
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("applicant");
		});

		it("should return null for invalid role", () => {
			const payload = { userEmail: "user@example.com", userRole: "superuser" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when userRole is missing", () => {
			const payload = { userEmail: "user@example.com" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when token is invalid", () => {
			const token = "invalid.token";

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when userRole is not a string", () => {
			const payload = { userEmail: "user@example.com", userRole: 123 };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when userRole is null", () => {
			const payload = { userEmail: "user@example.com", userRole: null };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});
	});

	describe("getUserEmail", () => {
		it("should extract email from valid token", () => {
			const payload = {
				userEmail: "test@example.com",
				userRole: "applicant",
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserEmail(token);

			expect(result).toBe("test@example.com");
		});

		it("should return null when userEmail is missing", () => {
			const payload = { userRole: "applicant" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserEmail(token);

			expect(result).toBeNull();
		});

		it("should return null when token is invalid", () => {
			const token = "invalid.token";

			const result = getUserEmail(token);

			expect(result).toBeNull();
		});

		it("should return null when token cannot be decoded", () => {
			const token = "header.invalidbase64!@#$.signature";

			const result = getUserEmail(token);

			expect(result).toBeNull();
		});
	});

	describe("isTokenExpired", () => {
		it("should return true for expired token", () => {
			const payload = {
				userEmail: "test@example.com",
				userRole: "applicant",
				exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			expect(result).toBe(true);
		});

		it("should return false for valid token", () => {
			const payload = {
				userEmail: "test@example.com",
				userRole: "applicant",
				exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			expect(result).toBe(false);
		});

		it("should return false when exp is missing", () => {
			const payload = { userEmail: "test@example.com", userRole: "applicant" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			expect(result).toBe(false);
		});

		it("should return false when token cannot be decoded", () => {
			const token = "invalid.token";

			const result = isTokenExpired(token);

			expect(result).toBe(false);
		});

		it("should handle token expiring exactly now", () => {
			const payload = {
				userEmail: "test@example.com",
				userRole: "applicant",
				exp: Math.floor(Date.now() / 1000), // Expiring exactly now
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			// Token is expired if exp <= current time
			expect(result).toBe(true);
		});
	});
});
