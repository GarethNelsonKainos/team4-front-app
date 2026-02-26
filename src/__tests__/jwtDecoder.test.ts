import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	decodeToken,
	getUserEmail,
	getUserRole,
	isTokenExpired,
} from "../utils/jwtDecoder.js";

describe("JWT Decoder", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("decodeToken", () => {
		it("should decode a valid JWT token", () => {
			const payload = { userEmail: "test@example.com", userRole: "admin" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = decodeToken(token);

			expect(result).toEqual(payload);
		});

		it("should return null for invalid token format (less than 3 parts)", () => {
			const token = "invalid.token";

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should return null for token with more than 3 parts", () => {
			const token = "header.payload.signature.extra";

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should return null for malformed base64 payload", () => {
			const token = "header.invalid-base64!@#$.signature";

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should return null for non-JSON payload", () => {
			const encodedPayload = Buffer.from("not json").toString("base64");
			const token = `header.${encodedPayload}.signature`;

			const result = decodeToken(token);

			expect(result).toBeNull();
		});

		it("should handle tokens with special characters in payload", () => {
			const payload = {
				userEmail: "user+test@example.com",
				userRole: "admin",
			};
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = decodeToken(token);

			expect(result).toEqual(payload);
		});
	});

	describe("getUserRole", () => {
		it("should return admin role from token", () => {
			const payload = { userRole: "admin" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("admin");
		});

		it("should return applicant role from token", () => {
			const payload = { userRole: "applicant" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("applicant");
		});

		it("should normalize ADMIN to admin", () => {
			const payload = { userRole: "ADMIN" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("admin");
		});

		it("should normalize Applicant to applicant", () => {
			const payload = { userRole: "Applicant" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBe("applicant");
		});

		it("should return null for invalid role", () => {
			const payload = { userRole: "superuser" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when userRole is missing", () => {
			const payload = { userEmail: "test@example.com" };
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
			const payload = { userRole: 123 };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when userRole is an object", () => {
			const payload = { userRole: { type: "admin" } };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});

		it("should return null when userRole is an array", () => {
			const payload = { userRole: ["admin", "user"] };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserRole(token);

			expect(result).toBeNull();
		});
	});

	describe("getUserEmail", () => {
		it("should return email from token", () => {
			const payload = { userEmail: "test@example.com" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserEmail(token);

			expect(result).toBe("test@example.com");
		});

		it("should return null when userEmail is missing", () => {
			const payload = { userRole: "admin" };
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

		it("should handle email with special characters", () => {
			const payload = { userEmail: "user+test@sub.example.com" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = getUserEmail(token);

			expect(result).toBe("user+test@sub.example.com");
		});
	});

	describe("isTokenExpired", () => {
		it("should return false for valid non-expired token", () => {
			const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
			const payload = { exp: futureTime };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			expect(result).toBe(false);
		});

		it("should return true for expired token", () => {
			const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
			const payload = { exp: pastTime };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			expect(result).toBe(true);
		});

		it("should return false when exp is missing", () => {
			const payload = { userEmail: "test@example.com" };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			expect(result).toBe(false);
		});

		it("should return false when token is invalid", () => {
			const token = "invalid.token";

			const result = isTokenExpired(token);

			expect(result).toBe(false);
		});

		it("should handle token that expires at current second", () => {
			const currentTime = Math.floor(Date.now() / 1000);
			const payload = { exp: currentTime };
			const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
				"base64",
			);
			const token = `header.${encodedPayload}.signature`;

			const result = isTokenExpired(token);

			// Should be expired or about to expire
			expect(typeof result).toBe("boolean");
		});
	});
});
