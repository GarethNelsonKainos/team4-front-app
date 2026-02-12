import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type AuthRequest,
	authMiddleware,
	clearAuthCookie,
	setAuthCookie,
} from "../utils/auth.js";

describe("Auth Utils", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			cookies: {},
		};
		mockResponse = {
			cookie: vi.fn(),
			clearCookie: vi.fn(),
			redirect: vi.fn(),
		};
		mockNext = vi.fn();
		vi.clearAllMocks();
		// Reset NODE_ENV for testing
		process.env.NODE_ENV = "test";
	});

	describe("setAuthCookie", () => {
		it("should set HTTP-only cookie with secure options", () => {
			const token = "test-jwt-token";

			setAuthCookie(token, mockResponse as Response);

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				"authToken",
				token,
				expect.objectContaining({
					httpOnly: true,
					sameSite: "strict",
					maxAge: 24 * 60 * 60 * 1000, // 24 hours
				}),
			);
		});

		it("should set secure flag to false in non-production", () => {
			process.env.NODE_ENV = "development";
			const token = "test-jwt-token";

			setAuthCookie(token, mockResponse as Response);

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				"authToken",
				token,
				expect.objectContaining({
					secure: false,
				}),
			);
		});

		it("should set secure flag to true in production", () => {
			process.env.NODE_ENV = "production";
			const token = "test-jwt-token";

			setAuthCookie(token, mockResponse as Response);

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				"authToken",
				token,
				expect.objectContaining({
					secure: true,
				}),
			);
		});

		it("should set cookie with 24 hour expiry", () => {
			const token = "test-jwt-token";
			const expectedMaxAge = 24 * 60 * 60 * 1000;

			setAuthCookie(token, mockResponse as Response);

			expect(mockResponse.cookie).toHaveBeenCalledWith(
				"authToken",
				token,
				expect.objectContaining({
					maxAge: expectedMaxAge,
				}),
			);
		});
	});

	describe("clearAuthCookie", () => {
		it("should clear auth cookie with matching options", () => {
			clearAuthCookie(mockResponse as Response);

			expect(mockResponse.clearCookie).toHaveBeenCalledWith(
				"authToken",
				expect.objectContaining({
					httpOnly: true,
					sameSite: "strict",
				}),
			);
		});

		it("should clear cookie with secure flag matching environment", () => {
			process.env.NODE_ENV = "production";

			clearAuthCookie(mockResponse as Response);

			expect(mockResponse.clearCookie).toHaveBeenCalledWith(
				"authToken",
				expect.objectContaining({
					secure: true,
				}),
			);
		});
	});

	describe("authMiddleware", () => {
		it("should call next() when auth token is present", () => {
			mockRequest.cookies = { authToken: "valid-token" };

			authMiddleware(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalled();
			expect(mockResponse.redirect).not.toHaveBeenCalled();
		});

		it("should store token in request object", () => {
			mockRequest.cookies = { authToken: "valid-token" };

			authMiddleware(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect((mockRequest as AuthRequest).authToken).toBe("valid-token");
		});

		it("should redirect to login when auth token is missing", () => {
			mockRequest.cookies = {};

			authMiddleware(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should redirect to login when auth token is undefined", () => {
			mockRequest.cookies = { authToken: undefined };

			authMiddleware(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should redirect to login when auth token is empty string", () => {
			mockRequest.cookies = { authToken: "" };

			authMiddleware(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
			expect(mockNext).not.toHaveBeenCalled();
		});
	});
});
