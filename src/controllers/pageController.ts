import type { NextFunction, Request, Response } from "express";
import { getJobRole, getJobRolesPublic } from "../utils/apiClient";
import type { AuthRequest } from "../utils/auth";

const showAdminFeatures = process.env.FEATURE_ADMIN_DASHBOARD === "true";

/**
 * Render home page
 */
export function getHomePage(req: Request, res: Response, _next: NextFunction) {
	try {
		const authReq = req as AuthRequest;

		res.render("pages/home.njk", {
			title: "Kainos Job Roles",
			heading: "Kainos Job Opportunities",
			message: "Find your dream job with us!",
			currentPage: "home",
			user: authReq.user,
			features: {
				adminDashboard: showAdminFeatures,
			},
		});
	} catch (error) {
		// Production: log error privately, redirect to generic error page
		console.error("Error rendering template:", error);
		res.redirect("/error");
	}
}

/**
 * Render jobs listing page - shows only open positions
 */
export async function getJobsPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		// Get user info
		const authReq = req as AuthRequest;

		// Check feature flag from environment variable
		const showJobDetail = process.env.FEATURE_JOB_DETAIL_VIEW === "true";

		// Fetch jobs from API
		const result = await getJobRolesPublic();

		if (!result.success) {
			console.error(
				"Error fetching jobs:",
				result.error,
				"Status:",
				result.status,
			);
			return res.redirect("/error");
		}

		const openJobRoles = result.data.filter(
			(job: { status: string }) => job.status?.toLowerCase() === "open",
		);

		res.render("pages/jobs.njk", {
			title: "Available Job Roles - Kainos",
			heading: "Kainos Job Opportunities",
			jobRoles: openJobRoles,
			currentPage: "jobs",

			user: authReq.user,
			features: {
				adminDashboard: showAdminFeatures,
				jobDetailView: showJobDetail,
			},
		});
	} catch (error) {
		// Production: log error privately, redirect to generic error page
		console.error("Error rendering jobs template:", error);
		res.redirect("/error");
	}
}

/**
 * Render job detail page
 */
export async function getJobDetailPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const jobApplyView = process.env.FEATURE_JOB_APPLY_VIEW === "true";
		// Handle route parameter - could be string or array, convert to number
		const jobId = parseInt(
			Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
			10,
		);

		// Validate that the ID is a valid number
		if (Number.isNaN(jobId)) {
			console.error(`❌ Invalid job ID: ${req.params.id}`);
			return res.redirect("/error");
		}

		// Get user info
		const authReq = req as AuthRequest;
		console.log(`🔍 PageController: Fetching job role with ID ${jobId}`);

		// Fetch specific job from API
		const result = await getJobRole(jobId);

		if (!result.success) {
			console.error("❌ PageController: Error fetching job:", {
				error: result.error,
				status: result.status,
				jobId: jobId,
			});
			return res.redirect("/error");
		}

		const job = result.data;
		console.log(`✅ PageController: Successfully got job data:`, job);

		if (!job) {
			// Production: redirect to error page instead of exposing "not found" details
			return res.redirect("/error");
		}

		res.render("pages/job-detail.njk", {
			title: `${job.roleName} - Kainos`, // Template string with embedded variable
			heading: "Kainos Job Opportunities",
			job: job,
			currentPage: "jobs",
			user: authReq.user,
			features: {
				adminDashboard: showAdminFeatures,
				jobApplyView: jobApplyView,
			},
		});
	} catch (error) {
		// Production: log error privately, redirect to generic error page
		console.error("Error rendering job detail template:", error);
		res.redirect("/error");
	}
}

/**
 * Render login page
 */
export function getLoginPage(req: Request, res: Response, _next: NextFunction) {
	try {
		const authReq = req as AuthRequest;
		res.render("pages/login.njk", {
			title: "Login - Kainos",
			currentPage: "login",
			user: authReq.user,
		});
	} catch (error) {
		// Production: log error privately, redirect to generic error page
		console.error("Error rendering login template:", error);
		res.redirect("/error");
	}
}

/**
 * Render register page
 */
export function getRegisterPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;
		res.render("pages/register.njk", {
			title: "Register - Kainos",
			currentPage: "register",
			user: authReq.user,
		});
	} catch (error) {
		// Production: log error privately, redirect to generic error page
		console.error("Error rendering register template:", error);
		res.redirect("/error");
	}
}

/**
 * Render generic error page
 */
export function getErrorPage(req: Request, res: Response, _next: NextFunction) {
	try {
		const authReq = req as AuthRequest;
		res.status(500).render("pages/error.njk", {
			title: "Error - Kainos",
			user: authReq.user,
		});
	} catch (error) {
		// Fallback if even error page fails
		console.error("Error rendering error page:", error);
		res
			.status(500)
			.send("An unexpected error occurred. Please try again later.");
	}
}

/**
 * Render login failed page
 */
export function getLoginFailedPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;
		res.status(401).render("pages/login-failed.njk", {
			title: "Login Failed - Kainos",
			user: authReq.user,
		});
	} catch (error) {
		// Fallback to generic error page
		console.error("Error rendering login failed page:", error);
		res.redirect("/error");
	}
}

/**
 * Render register failed page
 */
export function getRegisterFailedPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;
		res.status(400).render("pages/register-failed.njk", {
			title: "Registration Failed - Kainos",
			user: authReq.user,
		});
	} catch (error) {
		// Fallback to generic error page
		console.error("Error rendering register failed page:", error);
		res.redirect("/error");
	}
}

/**
 * Render admin dashboard page
 */
export function getAdminDashboard(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;
		res.render("pages/admin-dashboard.njk", {
			title: "Admin Dashboard - Kainos",
			currentPage: "admin",
			user: authReq.user,
		});
	} catch (error) {
		console.error("Error rendering admin dashboard:", error);
		res.redirect("/error");
	}
}

/**
 * Render admin jobs management page - list all jobs for editing/deleting
 */
export async function getAdminJobsPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;

		// Fetch all jobs from API
		const result = await getJobRolesPublic();

		if (!result.success) {
			console.error(
				"Error fetching jobs:",
				result.error,
				"Status:",
				result.status,
			);
			return res.redirect("/error");
		}

		res.render("pages/admin-jobs.njk", {
			title: "Manage Job Listings - Kainos",
			currentPage: "admin",
			jobRoles: result.data,
			user: authReq.user,
		});
	} catch (error) {
		console.error("Error rendering admin jobs page:", error);
		res.redirect("/error");
	}
}

/**
 * Render create new job page
 */
export function getAdminCreateJobPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;
		res.render("pages/admin-create-job.njk", {
			title: "Create New Job - Kainos",
			currentPage: "admin",
			user: authReq.user,
		});
	} catch (error) {
		console.error("Error rendering create job page:", error);
		res.redirect("/error");
	}
}

/**
 * Render create new admin account page
 */
export function getAdminCreateAdminPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;
		res.render("pages/admin-create-admin.njk", {
			title: "Create Admin Account - Kainos",
			currentPage: "admin",
			user: authReq.user,
		});
	} catch (error) {
		console.error("Error rendering create admin page:", error);
		res.redirect("/error");
	}
}
