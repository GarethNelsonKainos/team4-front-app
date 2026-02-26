import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as pageController from "../controllers/pageController.js";
import { jobRoles } from "../data/mockData.js";
import * as apiClient from "../utils/apiClient.js";
import type { AuthRequest } from "../utils/auth.js";

// Mock the apiClient module
vi.mock("../utils/apiClient.js");

// Type definitions for testing
interface JobRole {
	id: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: string;
	description: string;
	responsibilities: string[];
	sharepointUrl: string;
	numberOfOpenPositions: number;
}

interface JobsPageContext {
	jobRoles: JobRole[];
}

describe("PageController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRequest = {
			params: {},
		} as AuthRequest;

		// Add user info to mock request
		(mockRequest as AuthRequest).user = {
			email: "test@example.com",
			role: "applicant",
			isAuthenticated: true,
		};

		mockResponse = {
			render: vi.fn(),
			redirect: vi.fn(),
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		};
		mockNext = vi.fn();
		vi.clearAllMocks();

		// Setup the mock for getJobRolesPublic
		vi.mocked(apiClient.getJobRolesPublic).mockResolvedValue({
			success: true,
			data: jobRoles.map((job) => ({
				...job,
				jobRoleId: job.id,
			})),
		});

		// Set the feature flag environment variable for tests
		process.env.FEATURE_JOB_DETAIL_VIEW = "true";

		// Setup the mock for getJobRole (single job detail endpoint)
		vi.mocked(apiClient.getJobRole).mockImplementation(async (id: number) => {
			const job = jobRoles.find((j) => j.id === id);
			if (!job) {
				return { success: false, error: "Job role not found", status: 404 };
			}
			return {
				success: true,
				data: { ...job, jobRoleId: job.id },
			};
		});
	});

	describe("getApplicationSuccessPage", () => {
		it("should render application success page", () => {
			pageController.getApplicationSuccessPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/application-success.njk",
				expect.objectContaining({
					title: "Application Submitted",
					user: expect.objectContaining({
						isAuthenticated: true,
						role: "applicant",
					}),
				}),
			);
		});

		it("should redirect to error page on rendering exception", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getApplicationSuccessPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getJobsPage", () => {
		it("should redirect to error page when API call fails", async () => {
			vi.mocked(apiClient.getJobRolesPublic).mockResolvedValue({
				success: false,
				error: "Database error",
				status: 500,
			});

			await pageController.getJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getHomePage", () => {
		it("should render home page with correct data", () => {
			pageController.getHomePage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/home.njk",
				expect.objectContaining({
					title: "Kainos Job Roles",
					heading: "Kainos Job Opportunities",
					message: "Find your dream job with us!",
					currentPage: "home",
					user: expect.objectContaining({
						isAuthenticated: true,
						role: "applicant",
					}),
				}),
			);
		});

		it("should redirect to error page on exception", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getHomePage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should log errors privately", () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getHomePage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Error rendering template:",
				expect.any(Error),
			);
			consoleErrorSpy.mockRestore();
		});
	});

	describe("getJobsPage", () => {
		it("should render jobs page with only open job roles", async () => {
			await pageController.getJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			const openJobs = jobRoles.filter((job) => job.status === "open");

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/jobs.njk",
				expect.objectContaining({
					title: "Available Job Roles - Kainos",
					heading: "Kainos Job Opportunities",
					jobRoles: expect.arrayContaining(
						openJobs.map((job) => expect.objectContaining({ id: job.id })),
					),
					currentPage: "jobs",
					features: expect.objectContaining({
						jobDetailView: true,
					}),
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				}),
			);
		});

		it("should filter out closed job roles", async () => {
			await pageController.getJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			const renderCall = vi.mocked(mockResponse.render as Response["render"])
				.mock.calls[0];
			const passedJobRoles = (renderCall[1] as unknown as JobsPageContext)
				?.jobRoles;

			// Verify all passed jobs have status 'open'
			expect(
				passedJobRoles.every((job: JobRole) => job.status === "open"),
			).toBe(true);
		});

		it("should redirect to error page on exception", async () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getJobDetailPage", () => {
		it("should render job detail page for valid job ID", async () => {
			mockRequest.params = { id: "1" };

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			const job = jobRoles.find((job) => job.id === 1);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/job-detail.njk",
				expect.objectContaining({
					title: `${job?.roleName} - Kainos`,
					heading: "Kainos Job Opportunities",
					job: expect.objectContaining({ id: job?.id }),
					currentPage: "jobs",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				}),
			);
		});

		it("should handle array parameter format", async () => {
			mockRequest.params = { id: ["2"] };

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			const job = jobRoles.find((job) => job.id === 2);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/job-detail.njk",
				expect.objectContaining({
					title: `${job?.roleName} - Kainos`,
					heading: "Kainos Job Opportunities",
					job: expect.objectContaining({ id: job?.id }),
					currentPage: "jobs",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				}),
			);
		});

		it("should redirect to error page for non-existent job ID", async () => {
			mockRequest.params = { id: "999" };

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
			expect(mockResponse.render).not.toHaveBeenCalled();
		});

		it("should redirect to error page for non-numeric ID", async () => {
			mockRequest.params = { id: "abc" };

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should redirect to error page on exception", async () => {
			mockRequest.params = { id: "1" };
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getLoginPage", () => {
		it("should render login page with correct data", () => {
			pageController.getLoginPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login.njk",
				expect.objectContaining({
					title: "Login - Kainos",
					currentPage: "login",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				}),
			);
		});

		it("should redirect to error page on exception", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getLoginPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getRegisterPage", () => {
		it("should render register page with correct data", () => {
			pageController.getRegisterPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register.njk",
				expect.objectContaining({
					title: "Register - Kainos",
					currentPage: "register",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				}),
			);
		});

		it("should redirect to error page on exception", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getRegisterPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getErrorPage", () => {
		it("should render error page with 500 status", () => {
			pageController.getErrorPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/error.njk",
				expect.objectContaining({
					title: "Error - Kainos",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				}),
			);
		});

		it("should send fallback message if error page fails to render", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getErrorPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.send).toHaveBeenCalledWith(
				"An unexpected error occurred. Please try again later.",
			);
		});
	});

	describe("getApplyJobPage", () => {
		it("should render apply job page with correct data for authenticated applicant", async () => {
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/apply-job.njk",
				expect.objectContaining({
					title: expect.stringContaining("Apply for"),
					job: expect.objectContaining({
						jobRoleId: 1,
					}),
					userHasAppliedForJob: false,
					currentPage: "jobs",
					user: expect.objectContaining({
						isAuthenticated: true,
						role: "applicant",
					}),
				}),
			);
		});

		it("should redirect to login for unauthenticated user", async () => {
			(mockRequest as AuthRequest).user = {
				email: "",
				role: "applicant",
				isAuthenticated: false,
			};
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should redirect to login for non-applicant user", async () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should redirect to login when user is missing", async () => {
			(mockRequest as AuthRequest).user = undefined;
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should redirect to error page for invalid job ID", async () => {
			mockRequest.params = { id: "abc" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should redirect to error page for non-existent job", async () => {
			mockRequest.params = { id: "999" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should redirect to error page when API call fails", async () => {
			mockRequest.params = { id: "1" };
			vi.mocked(apiClient.getJobRole).mockResolvedValue({
				success: false,
				error: "API Error",
				status: 500,
			});

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should handle string array for route params", async () => {
			mockRequest.params = { id: ["1"] };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/apply-job.njk",
				expect.objectContaining({
					job: expect.objectContaining({
						jobRoleId: 1,
					}),
				}),
			);
		});

		it("should redirect to error page on render exception", async () => {
			mockRequest.params = { id: "1" };
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should log errors privately", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			mockRequest.params = { id: "1" };
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Error rendering apply job page:",
				expect.any(Error),
			);
			consoleErrorSpy.mockRestore();
		});
	});

	describe("getLoginFailedPage", () => {
		it("should render login failed page with 401 status", () => {
			pageController.getLoginFailedPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(401);
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/login-failed.njk",
				{
					title: "Login Failed - Kainos",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				},
			);
		});

		it("should redirect to error page if rendering fails", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getLoginFailedPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getRegisterFailedPage", () => {
		it("should render register failed page with 400 status", () => {
			pageController.getRegisterFailedPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/register-failed.njk",
				{
					title: "Registration Failed - Kainos",
					user: expect.objectContaining({
						isAuthenticated: true,
					}),
				},
			);
		});

		it("should redirect to error page if rendering fails", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getRegisterFailedPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getAdminDashboard", () => {
		it("should render admin dashboard page", () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};

			pageController.getAdminDashboard(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/admin-dashboard.njk",
				{
					title: "Admin Dashboard - Kainos",
					currentPage: "admin",
					user: expect.objectContaining({
						role: "admin",
						isAuthenticated: true,
					}),
				},
			);
		});

		it("should redirect to error page if rendering fails", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getAdminDashboard(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getAdminJobsPage", () => {
		it("should render admin jobs page with job roles", async () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};

			await pageController.getAdminJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(apiClient.getJobRolesPublic).toHaveBeenCalled();
			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/admin-jobs.njk",
				expect.objectContaining({
					title: "Manage Job Listings - Kainos",
					currentPage: "admin",
					jobRoles: expect.any(Array),
					user: expect.objectContaining({
						role: "admin",
					}),
				}),
			);
		});

		it("should redirect to error page when API call fails", async () => {
			vi.mocked(apiClient.getJobRolesPublic).mockResolvedValue({
				success: false,
				error: "API Error",
				status: 500,
			});

			await pageController.getAdminJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should redirect to error page if rendering fails", async () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getAdminJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getAdminCreateJobPage", () => {
		it("should render create job page", () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};

			pageController.getAdminCreateJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/admin-create-job.njk",
				{
					title: "Create New Job - Kainos",
					currentPage: "admin",
					user: expect.objectContaining({
						role: "admin",
					}),
				},
			);
		});

		it("should redirect to error page if rendering fails", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getAdminCreateJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getAdminCreateAdminPage", () => {
		it("should render create admin page", () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};

			pageController.getAdminCreateAdminPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/admin-create-admin.njk",
				{
					title: "Create Admin Account - Kainos",
					currentPage: "admin",
					user: expect.objectContaining({
						role: "admin",
					}),
				},
			);
		});

		it("should redirect to error page if rendering fails", () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			pageController.getAdminCreateAdminPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getAdminAdminsPage", () => {
		it("should render admin management page with mock admins", async () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};

			await pageController.getAdminAdminsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/admin-admins.njk",
				expect.objectContaining({
					title: "Manage Administrators - Kainos",
					currentPage: "admin",
					admins: expect.arrayContaining([
						expect.objectContaining({
							email: expect.any(String),
							role: "admin",
						}),
					]),
					user: expect.objectContaining({
						role: "admin",
					}),
				}),
			);
		});

		it("should redirect to error page if rendering fails", async () => {
			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getAdminAdminsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("getJobDetailPage - additional branch coverage", () => {
		it("should redirect to error when job is null after successful API call", async () => {
			mockRequest.params = { id: "1" };

			vi.mocked(apiClient.getJobRole).mockResolvedValue({
				success: true,
				data: null,
			});

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should handle non-numeric ID in string format", async () => {
			mockRequest.params = { id: "invalid" };

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should render job detail page when feature flag is disabled", async () => {
			process.env.FEATURE_JOB_APPLY_VIEW = "false";
			mockRequest.params = { id: "1" };

			await pageController.getJobDetailPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/job-detail.njk",
				expect.objectContaining({
					features: expect.objectContaining({
						jobApplyView: false,
					}),
				}),
			);
		});
	});

	describe("getApplyJobPage - additional branch coverage", () => {
		it("should redirect to login when user is not authenticated", async () => {
			(mockRequest as AuthRequest).user = undefined;
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should redirect to login when user role is not applicant", async () => {
			(mockRequest as AuthRequest).user = {
				email: "admin@example.com",
				role: "admin",
				isAuthenticated: true,
			};
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should redirect to login when user is not isAuthenticated", async () => {
			(mockRequest as AuthRequest).user = {
				email: "test@example.com",
				role: "applicant",
				isAuthenticated: false,
			};
			mockRequest.params = { id: "1" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
		});

		it("should redirect to error when job ID is non-numeric", async () => {
			(mockRequest as AuthRequest).user = {
				email: "test@example.com",
				role: "applicant",
				isAuthenticated: true,
			};
			mockRequest.params = { id: "invalid" };

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should redirect to error when job is null after successful API call", async () => {
			(mockRequest as AuthRequest).user = {
				email: "test@example.com",
				role: "applicant",
				isAuthenticated: true,
			};
			mockRequest.params = { id: "1" };

			vi.mocked(apiClient.getJobRole).mockResolvedValue({
				success: true,
				data: null,
			});

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});

		it("should redirect to error on exception", async () => {
			(mockRequest as AuthRequest).user = {
				email: "test@example.com",
				role: "applicant",
				isAuthenticated: true,
			};
			mockRequest.params = { id: "1" };

			vi.mocked(mockResponse.render as Response["render"]).mockImplementation(
				() => {
					throw new Error("Template error");
				},
			);

			await pageController.getApplyJobPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.redirect).toHaveBeenCalledWith("/error");
		});
	});

	describe("Feature flag coverage", () => {
		it("should have admin dashboard disabled by default", () => {
			delete process.env.FEATURE_ADMIN_DASHBOARD;

			pageController.getHomePage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/home.njk",
				expect.objectContaining({
					features: expect.objectContaining({
						adminDashboard: false,
					}),
				}),
			);
		});

		it("should show job detail feature when enabled", async () => {
			process.env.FEATURE_JOB_DETAIL_VIEW = "true";

			await pageController.getJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/jobs.njk",
				expect.objectContaining({
					features: expect.objectContaining({
						jobDetailView: true,
					}),
				}),
			);
		});

		it("should hide job detail feature when disabled", async () => {
			process.env.FEATURE_JOB_DETAIL_VIEW = "false";

			await pageController.getJobsPage(
				mockRequest as Request,
				mockResponse as Response,
				mockNext,
			);

			expect(mockResponse.render).toHaveBeenCalledWith(
				"pages/jobs.njk",
				expect.objectContaining({
					features: expect.objectContaining({
						jobDetailView: false,
					}),
				}),
			);
		});
	});
});
