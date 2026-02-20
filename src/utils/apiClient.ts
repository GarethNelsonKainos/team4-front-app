import axios, { type AxiosError, type AxiosInstance } from "axios";
import type FormData from "form-data";

/**
 * Server-side API client for communicating with the backend API
 * This ensures all API calls go through the server, not directly from the browser
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
});

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns Promise with token and user data
 */
export async function loginUser(email: string, password: string) {
	try {
		const response = await apiClient.post("/api/login", {
			email: email,
			password: password,
		});

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Login failed",
			status: axiosError.response?.status,
		};
	}
}

/**
 * Register a new user
 * @param email - User email
 * @param password - User password
 * @returns Promise with registration result
 */
export async function registerUser(email: string, password: string) {
	try {
		const response = await apiClient.post("/api/register", {
			email: email,
			password: password,
		});
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Registration failed",
			status: axiosError.response?.status,
		};
	}
}

/**
 * Get all job roles (public endpoint - no authentication required)
 * @returns Promise with job roles data
 */
export async function getJobRolesPublic() {
	try {
		const response = await apiClient.get("/api/job-roles");
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Failed to fetch job roles",
			status: axiosError.response?.status,
		};
	}
}

/**
 * Get a specific job role by ID (public endpoint - no authentication required)
 * @param id - Job role ID
 * @returns Promise with job role data
 */
export async function getJobRole(id: number) {
	try {
		const response = await apiClient.get(`/api/job-roles/${id}`);
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Failed to fetch job role",
			status: axiosError.response?.status,
		};
	}
}

/**
 * Create a new job role (requires authentication)
 * @param jobRoleData - Job role data
 * @param token - JWT token for authentication
 * @returns Promise with created job role data
 */
export async function createJobRole(
	jobRoleData: Record<string, unknown>,
	token: string,
) {
	try {
		const response = await apiClient.post("/api/job-roles", jobRoleData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Failed to create job role",
			status: axiosError.response?.status,
		};
	}
}

/**
 * Update an existing job role (requires authentication)
 * @param id - Job role ID
 * @param jobRoleData - Updated job role data
 * @param token - JWT token for authentication
 * @returns Promise with updated job role data
 */
export async function updateJobRole(
	id: number,
	jobRoleData: Record<string, unknown>,
	token: string,
) {
	try {
		const response = await apiClient.put(`/api/job-roles/${id}`, jobRoleData, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Failed to update job role",
			status: axiosError.response?.status,
		};
	}
}

/**
 * Delete a job role (requires authentication)
 * @param id - Job role ID
 * @param token - JWT token for authentication
 * @returns Promise with deletion result
 */
export async function deleteJobRole(id: number, token: string) {
	try {
		const response = await apiClient.delete(`/api/job-roles/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error: axiosError.response?.data?.message || "Failed to delete job role",
			status: axiosError.response?.status,
		};
	}
}

/**
 * @param formData - FormData object containing the CV file and job role ID
 * @param token - JWT token for authentication
 */
export async function submitJobApplication(formData: FormData, token: string) {
	try {
		const response = await apiClient.post("/api/apply", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			},
		});
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		const axiosError = error as AxiosError<{ message?: string }>;
		return {
			success: false,
			error:
				axiosError.response?.data?.message ||
				"Failed to submit application. Please try again.",
			status: axiosError.response?.status,
		};
	}
}

export default apiClient;
