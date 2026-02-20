import type { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock axios at the module level
vi.mock("axios");

describe("API Client - submitJobApplication", () => {
	const mockToken = "test-jwt-token";
	const mockFormData = new FormData();
	mockFormData.append("cv", new File(["test content"], "resume.pdf"));
	mockFormData.append("jobRoleId", "123");

	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let submitJobApplication: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		// Create mock axios instance
		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		// Import axios and mock it
		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		// Now import apiClient to get the fresh instance with our mocked axios
		const apiClient = await import("../utils/apiClient.js");
		submitJobApplication = apiClient.submitJobApplication;
	});

	afterEach(() => {
		vi.resetModules();
	});

	describe("submitJobApplication function", () => {
		it("should export submitJobApplication function", async () => {
			const apiClient = await import("../utils/apiClient.js");
			expect(typeof apiClient.submitJobApplication).toBe("function");
		});

		it("should be an async function", async () => {
			const result = submitJobApplication.constructor.name;
			expect(result).toBe("AsyncFunction");
		});

		it("should accept FormData and token as parameters", async () => {
			const params = submitJobApplication.toString();
			expect(params).toContain("formData");
			expect(params).toContain("token");
		});
	});

	describe("submitJobApplication API calls", () => {
		it("should POST to /api/apply with correct endpoint", async () => {
			const mockResponse = { data: { success: true } };
			mockAxiosInstance.post.mockResolvedValue(mockResponse);

			await submitJobApplication(mockFormData, mockToken);

			expect(mockAxiosInstance.post).toHaveBeenCalledWith(
				"/api/apply",
				mockFormData,
				expect.objectContaining({
					headers: expect.any(Object),
				}),
			);
		});

		it("should set Authorization header with Bearer token", async () => {
			const mockResponse = { data: { success: true } };
			mockAxiosInstance.post.mockResolvedValue(mockResponse);

			await submitJobApplication(mockFormData, mockToken);

			const callArgs = mockAxiosInstance.post.mock.calls[0][2];
			expect(callArgs.headers.Authorization).toBe(`Bearer ${mockToken}`);
		});

		it("should set Content-Type header to multipart/form-data", async () => {
			const mockResponse = { data: { success: true } };
			mockAxiosInstance.post.mockResolvedValue(mockResponse);

			await submitJobApplication(mockFormData, mockToken);

			const callArgs = mockAxiosInstance.post.mock.calls[0][2];
			expect(callArgs.headers["Content-Type"]).toBe("multipart/form-data");
		});
	});

	describe("submitJobApplication success handling", () => {
		it("should return success response with data on successful submission", async () => {
			const mockData = {
				id: 1,
				jobRoleId: "123",
				userId: "user123",
				status: "submitted",
			};
			const mockResponse = { data: mockData };
			mockAxiosInstance.post.mockResolvedValue(mockResponse);

			const result = await submitJobApplication(mockFormData, mockToken);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockData);
			expect(result.error).toBeUndefined();
		});

		it("should handle empty response data on success", async () => {
			const mockResponse = { data: { success: true } };
			mockAxiosInstance.post.mockResolvedValue(mockResponse);

			const result = await submitJobApplication(mockFormData, mockToken);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
		});
	});

	describe("submitJobApplication error handling", () => {
		it("should return error response with message on failed submission", async () => {
			const errorMessage = "File size exceeds maximum allowed";
			const mockError = {
				response: {
					status: 400,
					data: { message: errorMessage },
				},
			} as unknown as AxiosError<{ message?: string }>;
			mockAxiosInstance.post.mockRejectedValue(mockError);

			const result = await submitJobApplication(mockFormData, mockToken);

			expect(result.success).toBe(false);
			expect(result.error).toBe(errorMessage);
			expect(result.status).toBe(400);
		});

		it("should return default error message when response message is missing", async () => {
			const mockError = {
				response: {
					status: 500,
					data: {},
				},
			} as unknown as AxiosError<{ message?: string }>;
			mockAxiosInstance.post.mockRejectedValue(mockError);

			const result = await submitJobApplication(mockFormData, mockToken);

			expect(result.success).toBe(false);
			expect(result.error).toBe(
				"Failed to submit application. Please try again.",
			);
			expect(result.status).toBe(500);
		});

		it("should handle 401 Unauthorized error", async () => {
			const mockError = {
				response: {
					status: 401,
					data: { message: "Unauthorized" },
				},
			} as unknown as AxiosError<{ message?: string }>;
			mockAxiosInstance.post.mockRejectedValue(mockError);

			const result = await submitJobApplication(mockFormData, mockToken);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Unauthorized");
			expect(result.status).toBe(401);
		});

		it("should handle network errors gracefully", async () => {
			const mockError = new Error("Network timeout");
			mockAxiosInstance.post.mockRejectedValue(mockError);

			const result = await submitJobApplication(mockFormData, mockToken);

			expect(result.success).toBe(false);
			expect(result.error).toBe(
				"Failed to submit application. Please try again.",
			);
		});
	});
});
