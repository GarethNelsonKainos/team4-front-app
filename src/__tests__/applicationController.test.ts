import type { NextFunction, Request, Response } from "express";
import FormData from "form-data";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as applicationController from "../controllers/applicationController.js";
import * as apiClient from "../utils/apiClient.js";
import type { AuthRequest } from "../utils/auth.js";

vi.mock("../utils/apiClient.js");

describe("ApplicationController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			params: { id: "123" },
			cookies: { authToken: "test-token" },
			file: {
				buffer: Buffer.from("fake-cv"),
				originalname: "cv.pdf",
				size: 12,
			} as Express.Multer.File,
		} as unknown as AuthRequest;

		(mockRequest as AuthRequest).user = {
			email: "applicant@example.com",
			role: "applicant",
			isAuthenticated: true,
		};

		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		};

		mockNext = vi.fn();
		vi.clearAllMocks();
	});

	it("should return 401 when user is not authenticated", async () => {
		(mockRequest as AuthRequest).user = {
			email: null,
			role: null,
			isAuthenticated: false,
		};

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "You must be logged in as an applicant to submit an application",
		});
	});

	it("should return 401 when user is not an applicant", async () => {
		(mockRequest as AuthRequest).user = {
			email: "admin@example.com",
			role: "admin",
			isAuthenticated: true,
		};

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "You must be logged in as an applicant to submit an application",
		});
	});

	it("should return 400 when CV file is missing", async () => {
		mockRequest.file = undefined;

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "CV file is required",
		});
	});

	it("should return 400 when job role ID is missing", async () => {
		mockRequest.params = {};

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(400);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "Job role ID is required",
		});
	});

	it("should return error response when API submission fails", async () => {
		vi.mocked(apiClient.submitJobApplication).mockResolvedValue({
			success: false,
			error: "Upload failed",
			status: 422,
		});

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(apiClient.submitJobApplication).toHaveBeenCalledWith(
			expect.any(FormData),
			"test-token",
		);
		expect(mockResponse.status).toHaveBeenCalledWith(422);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "Upload failed",
		});
	});

	it("should return 200 when application is submitted successfully", async () => {
		vi.mocked(apiClient.submitJobApplication).mockResolvedValue({
			success: true,
			data: { id: 1 },
		});

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(apiClient.submitJobApplication).toHaveBeenCalledWith(
			expect.any(FormData),
			"test-token",
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: true,
			message: "Application submitted successfully",
		});
	});

	it("should return 500 when an exception is thrown", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		vi.mocked(apiClient.submitJobApplication).mockRejectedValue(
			new Error("Network error"),
		);

		await applicationController.submitApplication(
			mockRequest as Request,
			mockResponse as Response,
			mockNext,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "Network error",
		});
		consoleErrorSpy.mockRestore();
	});
});
