import type { NextFunction, Request, Response } from "express";
import FormData from "form-data";
import { submitJobApplication } from "../utils/apiClient";
import type { AuthRequest } from "../utils/auth";

/**
 * Handle job application submission with CV upload
 */
export async function submitApplication(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	try {
		const authReq = req as AuthRequest;

		// Check if user is authenticated and is an applicant
		if (
			!authReq.user ||
			!authReq.user.isAuthenticated ||
			authReq.user.role !== "applicant"
		) {
			return res.status(401).json({
				success: false,
				message:
					"You must be logged in as an applicant to submit an application",
			});
		}

		// Check if file was uploaded
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "CV file is required",
			});
		}

		// Check if jobRoleId was provided
		const jobRoleId = req.params.id;
		if (!jobRoleId) {
			return res.status(400).json({
				success: false,
				message: "Job role ID is required",
			});
		}

		console.log(`📤 Processing application for job ${jobRoleId}:`, {
			fileName: req.file.originalname,
			fileSize: req.file.size,
			userId: authReq.user.email,
		});

		// Create FormData with file and jobRoleId
		const formData = new FormData();
		const jobRoleIdStr = Array.isArray(jobRoleId) ? jobRoleId[0] : jobRoleId;
		formData.append("cv", req.file.buffer, req.file.originalname);
		formData.append("jobRoleId", jobRoleIdStr);

		// Call backend API through server-side client
		const result = await submitJobApplication(formData, req.cookies.authToken);

		if (!result.success) {
			console.error("❌ Application submission failed:", result.error);
			return res.status(result.status || 500).json({
				success: false,
				message: result.error || "Failed to submit application",
			});
		}

		console.log(`✅ Application submitted successfully for job ${jobRoleId}`);
		return res.status(200).json({
			success: true,
			message: "Application submitted successfully",
		});
	} catch (error) {
		console.error("❌ Application submission error:", error);
		return res.status(500).json({
			success: false,
			message:
				error instanceof Error
					? error.message
					: "An error occurred while processing your application",
		});
	}
}
