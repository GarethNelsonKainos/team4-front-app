import type { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock axios at the module level
vi.mock("axios");

describe("API Client - loginUser", () => {
	const mockEmail = "test@example.com";
	const mockPassword = "password123";

	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let loginUser: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		loginUser = apiClient.loginUser;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully login with valid credentials", async () => {
		const mockData = { token: "jwt-token", user: { email: mockEmail } };
		mockAxiosInstance.post.mockResolvedValue({ data: mockData });

		const result = await loginUser(mockEmail, mockPassword);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/login", {
			email: mockEmail,
			password: mockPassword,
		});
	});

	it("should handle login failure with error message", async () => {
		const errorMessage = "Invalid credentials";
		const mockError = {
			response: {
				status: 401,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.post.mockRejectedValue(mockError);

		const result = await loginUser(mockEmail, mockPassword);

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
		expect(result.status).toBe(401);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.post.mockRejectedValue(mockError);

		const result = await loginUser(mockEmail, mockPassword);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Login failed");
	});
});

describe("API Client - registerUser", () => {
	const mockEmail = "newuser@example.com";
	const mockPassword = "newpassword123";

	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let registerUser: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		registerUser = apiClient.registerUser;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully register a new user", async () => {
		const mockData = { message: "User registered successfully" };
		mockAxiosInstance.post.mockResolvedValue({ data: mockData });

		const result = await registerUser(mockEmail, mockPassword);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/register", {
			email: mockEmail,
			password: mockPassword,
		});
	});

	it("should handle registration failure", async () => {
		const errorMessage = "Email already exists";
		const mockError = {
			response: {
				status: 409,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.post.mockRejectedValue(mockError);

		const result = await registerUser(mockEmail, mockPassword);

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
		expect(result.status).toBe(409);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.post.mockRejectedValue(mockError);

		const result = await registerUser(mockEmail, mockPassword);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Registration failed");
	});
});

describe("API Client - getJobRolesPublic", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let getJobRolesPublic: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		getJobRolesPublic = apiClient.getJobRolesPublic;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully fetch job roles", async () => {
		const mockData = [
			{ id: 1, title: "Developer" },
			{ id: 2, title: "Designer" },
		];
		mockAxiosInstance.get.mockResolvedValue({ data: mockData });

		const result = await getJobRolesPublic();

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/job-roles");
	});

	it("should handle fetch failure", async () => {
		const errorMessage = "Service unavailable";
		const mockError = {
			response: {
				status: 503,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.get.mockRejectedValue(mockError);

		const result = await getJobRolesPublic();

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.get.mockRejectedValue(mockError);

		const result = await getJobRolesPublic();

		expect(result.success).toBe(false);
		expect(result.error).toBe("Failed to fetch job roles");
	});
});

describe("API Client - getJobRole", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let getJobRole: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		getJobRole = apiClient.getJobRole;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully fetch a specific job role", async () => {
		const mockData = { id: 1, title: "Developer", description: "Dev role" };
		mockAxiosInstance.get.mockResolvedValue({ data: mockData });

		const result = await getJobRole(1);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/job-roles/1");
	});

	it("should handle 404 for non-existent job role", async () => {
		const errorMessage = "Job role not found";
		const mockError = {
			response: {
				status: 404,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.get.mockRejectedValue(mockError);

		const result = await getJobRole(999);

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
		expect(result.status).toBe(404);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.get.mockRejectedValue(mockError);

		const result = await getJobRole(1);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Failed to fetch job role");
	});
});

describe("API Client - createJobRole", () => {
	const mockToken = "admin-jwt-token";
	const mockJobData = {
		title: "New Role",
		description: "New role description",
	};

	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let createJobRole: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		createJobRole = apiClient.createJobRole;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully create a job role", async () => {
		const mockData = { id: 3, ...mockJobData };
		mockAxiosInstance.post.mockResolvedValue({ data: mockData });

		const result = await createJobRole(mockJobData, mockToken);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.post).toHaveBeenCalledWith(
			"/api/job-roles",
			mockJobData,
			{
				headers: {
					Authorization: `Bearer ${mockToken}`,
				},
			},
		);
	});

	it("should handle authorization failure", async () => {
		const errorMessage = "Unauthorized";
		const mockError = {
			response: {
				status: 401,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.post.mockRejectedValue(mockError);

		const result = await createJobRole(mockJobData, mockToken);

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
		expect(result.status).toBe(401);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.post.mockRejectedValue(mockError);

		const result = await createJobRole(mockJobData, mockToken);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Failed to create job role");
	});
});

describe("API Client - updateJobRole", () => {
	const mockToken = "admin-jwt-token";
	const mockJobData = {
		title: "Updated Role",
		description: "Updated description",
	};

	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let updateJobRole: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		updateJobRole = apiClient.updateJobRole;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully update a job role", async () => {
		const mockData = { id: 1, ...mockJobData };
		mockAxiosInstance.put.mockResolvedValue({ data: mockData });

		const result = await updateJobRole(1, mockJobData, mockToken);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.put).toHaveBeenCalledWith(
			"/api/job-roles/1",
			mockJobData,
			{
				headers: {
					Authorization: `Bearer ${mockToken}`,
				},
			},
		);
	});

	it("should handle 404 for non-existent job role", async () => {
		const errorMessage = "Job role not found";
		const mockError = {
			response: {
				status: 404,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.put.mockRejectedValue(mockError);

		const result = await updateJobRole(999, mockJobData, mockToken);

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
		expect(result.status).toBe(404);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.put.mockRejectedValue(mockError);

		const result = await updateJobRole(1, mockJobData, mockToken);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Failed to update job role");
	});
});

describe("API Client - deleteJobRole", () => {
	const mockToken = "admin-jwt-token";

	// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
	let mockAxiosInstance: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type changes across test lifecycle
	let deleteJobRole: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();

		mockAxiosInstance = {
			post: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		};

		const axios = await import("axios");
		vi.mocked(axios.default.create).mockReturnValue(mockAxiosInstance);

		const apiClient = await import("../utils/apiClient.js");
		deleteJobRole = apiClient.deleteJobRole;
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should successfully delete a job role", async () => {
		const mockData = { message: "Job role deleted successfully" };
		mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

		const result = await deleteJobRole(1, mockToken);

		expect(result.success).toBe(true);
		expect(result.data).toEqual(mockData);
		expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/api/job-roles/1", {
			headers: {
				Authorization: `Bearer ${mockToken}`,
			},
		});
	});

	it("should handle 404 for non-existent job role", async () => {
		const errorMessage = "Job role not found";
		const mockError = {
			response: {
				status: 404,
				data: { message: errorMessage },
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.delete.mockRejectedValue(mockError);

		const result = await deleteJobRole(999, mockToken);

		expect(result.success).toBe(false);
		expect(result.error).toBe(errorMessage);
		expect(result.status).toBe(404);
	});

	it("should return default error message when response message is missing", async () => {
		const mockError = {
			response: {
				status: 500,
				data: {},
			},
		} as unknown as AxiosError<{ message?: string }>;
		mockAxiosInstance.delete.mockRejectedValue(mockError);

		const result = await deleteJobRole(1, mockToken);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Failed to delete job role");
	});
});

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
