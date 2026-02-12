import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import nunjucks from "nunjucks";
import * as authController from "./controllers/authController";
import * as pageController from "./controllers/pageController";

const app = express();
const port = process.env.PORT || 3000;

nunjucks.configure("views", {
	autoescape: true,
	express: app,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Page routes
app.get("/", pageController.getHomePage);
app.get("/jobs", pageController.getJobsPage);
app.get("/job-roles/:id", pageController.getJobDetailPage);
app.get("/login", pageController.getLoginPage);
app.get("/register", pageController.getRegisterPage);

// Error page routes
app.get("/error", pageController.getErrorPage);
app.get("/login-failed", pageController.getLoginFailedPage);
app.get("/register-failed", pageController.getRegisterFailedPage);

// API routes
app.post("/api/login", authController.login);
app.post("/api/register", authController.register);
app.post("/api/logout", authController.logout);
app.get("/api/auth-status", authController.checkAuthStatus);

export { app };

const _server = app.listen(port, () => {
	console.log(`App now listening on port ${port}`);
	console.log("Server started successfully...");
});
