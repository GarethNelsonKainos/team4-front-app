import type { NextFunction, Request, Response } from "express";
import { jobRoles } from "../data/mockData";

/**
 * Render home page
 */
export function getHomePage(_req: Request, res: Response, _next: NextFunction) {
	try {
		res.render("pages/home.njk", {
			title: "Kainos Job Roles",
			heading: "Kainos Job Opportunities",
			message: "Find your dream job with us!",
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
export function getJobsPage(_req: Request, res: Response, _next: NextFunction) {
	try {
		// Filter array to show only open jobs using arrow function
		const openJobRoles = jobRoles.filter((job) => job.status === "open");

		res.render("pages/jobs.njk", {
			title: "Available Job Roles - Kainos",
			heading: "Kainos Job Opportunities",
			jobRoles: openJobRoles,
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
export function getJobDetailPage(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		// Handle route parameter - could be string or array, convert to number
		const jobId = parseInt(
			Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
			10,
		);

		// Find job by ID using array.find() method
		const job = jobRoles.find((job) => job.id === jobId);

		if (!job) {
			// Production: redirect to error page instead of exposing "not found" details
			return res.redirect("/error");
		}

		res.render("pages/job-detail.njk", {
			title: `${job.roleName} - Kainos`, // Template string with embedded variable
			heading: "Kainos Job Opportunities",
			job: job,
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
export function getLoginPage(
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		res.render("pages/login.njk", {
			title: "Login - Kainos",
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
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		res.render("pages/register.njk", {
			title: "Register - Kainos",
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
export function getErrorPage(
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		res.status(500).render("pages/error.njk", {
			title: "Error - Kainos",
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
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		res.status(401).render("pages/login-failed.njk", {
			title: "Login Failed - Kainos",
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
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		res.status(400).render("pages/register-failed.njk", {
			title: "Registration Failed - Kainos",
		});
	} catch (error) {
		// Fallback to generic error page
		console.error("Error rendering register failed page:", error);
		res.redirect("/error");
	}
}
