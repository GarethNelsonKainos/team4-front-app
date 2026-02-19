import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import nunjucks from "nunjucks";
import * as authController from "./controllers/authController";
import * as pageController from "./controllers/pageController";
import { authMiddleware, requireAdmin } from "./utils/auth";

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
app.use(authMiddleware);

app.get("/", pageController.getHomePage);

// Jobs listing route - shows only open positions
app.get("/job-roles", pageController.getJobsPage);

// Alias for /job-roles
app.get("/jobs", pageController.getJobsPage);

// Job detail route - :id is a route parameter (e.g. /job-roles/123)
app.get("/job-roles/:id", pageController.getJobDetailPage);

// Login page route
app.get("/login", pageController.getLoginPage);

// Register page route
app.get("/register", pageController.getRegisterPage);

// Login failed page route
app.get("/login-failed", pageController.getLoginFailedPage);

// Register failed page route
app.get("/register-failed", pageController.getRegisterFailedPage);

// Error page route
app.get("/error", pageController.getErrorPage);

// Admin routes
app.get("/admin", requireAdmin, pageController.getAdminDashboard);
app.get("/admin/jobs", requireAdmin, pageController.getAdminJobsPage);
app.get(
	"/admin/create-job",
	requireAdmin,
	pageController.getAdminCreateJobPage,
);
app.get(
	"/admin/create-admin",
	requireAdmin,
	pageController.getAdminCreateAdminPage,
);
app.get("/admin/admins", requireAdmin, pageController.getAdminAdminsPage);

// API Routes
app.post("/api/login", authController.login);
app.post("/api/register", authController.register);
app.post("/api/logout", authController.logout);
app.get("/api/logout", authController.logout);
app.get("/api/auth-status", authController.checkAuthStatus);

export { app };

const _server = app.listen(port, () => {
	console.log(`App now listening on port ${port}`);
	console.log("Server started successfully...");
});
