import "dotenv/config";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import nunjucks from "nunjucks";
import * as authController from "./controllers/authController";
import * as pageController from "./controllers/pageController";
import { jobRoles } from "./data/mockData";

const app = express();
const port = process.env.PORT || 3000;

nunjucks.configure("views", {
	autoescape: true,
	express: app,
});

// Add custom date filter
const nunjucksEnv = nunjucks.configure("views", {
	autoescape: true,
	express: app,
});

nunjucksEnv.addFilter("formatDate", (dateString: string) => {
	if (!dateString) return "";
	const [year, month, day] = dateString.split("-");
	return `${day}-${month}-${year}`;
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
	try {
		res.render("pages/home.njk", {
			title: "Kainos Job Roles",
			heading: "Kainos Job Opportunities",
			message: "Find your dream job with us!",
			currentPage: "home",
		});
	} catch (error) {
		console.error("Error rendering template:", error);
		res.status(500).send("Error rendering template");
	}
});

// Jobs listing route - shows only open positions
app.get("/jobs", (_req: Request, res: Response, _next: NextFunction) => {
	try {
		// Filter array to show only open jobs using arrow function
		const openJobRoles = jobRoles.filter((job) => job.status === "open");

		res.render("pages/jobs.njk", {
			title: "Available Job Roles - Kainos",
			heading: "Kainos Job Opportunities",
			jobRoles: openJobRoles,
			currentPage: "jobs",
		});
	} catch (error) {
		console.error("Error rendering jobs template:", error);
		res.status(500).send("Error rendering jobs template");
	}
});

// Job detail route - :id is a route parameter (e.g. /job-roles/123)
app.get(
	"/job-roles/:id",
	(req: Request, res: Response, _next: NextFunction) => {
		try {
			// Handle route parameter - could be string or array, convert to number
			const jobId = parseInt(
				Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
				10,
			);

			// Validate that the ID is a valid number
			if (Number.isNaN(jobId)) {
				return res.redirect("/error");
			}

			// Find job by ID using array.find() method
			const job = jobRoles.find((job) => job.id === jobId);

			if (!job) {
				return res.redirect("/error");
			}

			res.render("pages/job-detail.njk", {
				title: `${job.roleName} - Kainos`, // Template string with embedded variable
				heading: "Kainos Job Opportunities",
				job: job,
				currentPage: "jobs",
			});
		} catch (error) {
			console.error("Error rendering job detail template:", error);
			res.status(500).send("Error rendering job detail template");
		}
	},
);

// Login page route
app.get("/login", (_req: Request, res: Response, _next: NextFunction) => {
	try {
		res.render("pages/login.njk", {
			title: "Login - Kainos",
			currentPage: "login",
		});
	} catch (error) {
		console.error("Error rendering login template:", error);
		res.status(500).send("Error rendering login template");
	}
});

// Register page route
app.get("/register", pageController.getRegisterPage);

// Error page route
app.get("/error", pageController.getErrorPage);

// Login failed page route
app.get("/login-failed", pageController.getLoginFailedPage);

// Register failed page route
app.get("/register-failed", pageController.getRegisterFailedPage);

// API Routes
app.post("/api/login", authController.login);
app.post("/api/register", authController.register);
app.post("/api/logout", authController.logout);
app.get("/api/auth-status", authController.checkAuthStatus);

export { app };

const _server = app.listen(port, () => {
	console.log(`App now listening on port ${port}`);
	console.log("Server started successfully...");
});
