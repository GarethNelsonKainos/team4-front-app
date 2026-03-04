import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import nunjucks from "nunjucks";
import * as applicationController from "./controllers/applicationController.js";
import * as authController from "./controllers/authController.js";
import * as pageController from "./controllers/pageController.js";
import { authMiddleware, requireAdmin } from "./utils/auth.js";
import { cvUploadConfig } from "./utils/multerConfig.js";

const app = express();
const rawPort = process.env.PORT;
const parsedPort = rawPort !== undefined ? Number(rawPort) : NaN;
const port = Number.isNaN(parsedPort) ? 3000 : parsedPort;

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

// Job apply route - allows user to upload CV and apply for a job
app.get("/job-roles/:id/apply", pageController.getApplyJobPage);

// Login page route
app.get("/login", pageController.getLoginPage);

// Register page route
app.get("/register", pageController.getRegisterPage);

// Login failed page route
app.get("/login-failed", pageController.getLoginFailedPage);

// Register failed page route
app.get("/register-failed", pageController.getRegisterFailedPage);

// Application success page route
app.get("/application-success", pageController.getApplicationSuccessPage);

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

// Application submission route
app.post(
  "/apply/:id",
  cvUploadConfig.single("cv"),
  applicationController.submitApplication,
);

export function startServer() {
  return app.listen(port, () => {
    console.log(`App now listening on port ${port}`);
    console.log("Server started successfully...");
  });
}

export function isMainModule() {
  return import.meta.url === `file://${process.argv[1]}`;
}

export { app, port };

// Only start the server if this module is run directly (not imported in tests)
/* c8 ignore start */
if (isMainModule()) {
  startServer();
}
/* c8 ignore stop */
