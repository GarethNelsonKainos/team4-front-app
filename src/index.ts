import "dotenv/config";
import cookieParser from "cookie-parser";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import nunjucks from "nunjucks";
import * as authController from "./controllers/authController";
import * as pageController from "./controllers/pageController";

const app = express();
const port = process.env.PORT || 3000;

// Configure once and reuse the environment for filters
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
app.use(express.urlencoded({ extended: true }));
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
app.get("/jobs", pageController.getJobsPage);

// Job detail route - :id is a route parameter (e.g. /job-roles/123)
app.get("/job-roles/:id", pageController.getJobDetailPage);

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
