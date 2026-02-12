import axios, { type AxiosError, type AxiosInstance } from "axios";

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
 * Get all job roles (requires authentication token)
 * @param token - JWT token for authentication
 * @returns Promise with job roles data
 */
export async function getJobRoles(token: string) {
	try {
		const response = await apiClient.get("/api/job-roles", {
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
			error: axiosError.response?.data?.message || "Failed to fetch job roles",
			status: axiosError.response?.status,
		};
	}
}

export default apiClient;
