import type { NextFunction, Request, Response } from "express";
import express from "express";
import nunjucks from "nunjucks";
import { jobRoles } from "./data/mockData";

const app = express();
const port = 3000;

nunjucks.configure("src", {
	autoescape: true,
	express: app,
});

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("src"));

app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
	try {
		res.render("templates/pages/home.njk", {
			title: "Kainos Job Roles",
			heading: "Kainos Job Opportunities",
			message: "Find your dream job with us!",
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

		res.render("templates/pages/jobs.njk", {
			title: "Available Job Roles - Kainos",
			heading: "Kainos Job Opportunities",
			jobRoles: openJobRoles,
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

			// Find job by ID using array.find() method
			const job = jobRoles.find((job) => job.id === jobId);

			if (!job) {
				res.status(404).send("Job role not found");
				return;
			}

			res.render("templates/pages/job-detail.njk", {
				title: `${job.roleName} - Kainos`, // Template string with embedded variable
				heading: "Kainos Job Opportunities",
				job: job,
			});
		} catch (error) {
			console.error("Error rendering job detail template:", error);
			res.status(500).send("Error rendering job detail template");
		}
	},
);

const _server = app.listen(port, () => {
	console.log(`App listening on port ${port}`);
	console.log("Server started successfully...");
});
