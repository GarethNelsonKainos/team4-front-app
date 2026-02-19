/**
 * Client-side service for handling job application submission
 * Handles all API communication with the server for application workflows
 */

async function submitJobApplication(file, jobRoleId) {
	try {
		const formData = new FormData();
		formData.append("cv", file);
		formData.append("jobRoleId", jobRoleId);

		const response = await fetch("/api/applications/submit", {
			method: "POST",
			body: formData,
		});

		const data = await response.json();

		if (response.ok) {
			return {
				success: true,
				message: "Application submitted successfully",
			};
		}

		return {
			success: false,
			message:
				data.message || "An error occurred during upload. Please try again.",
			error: data.error,
		};
	} catch (error) {
		console.error("Application submission error:", error);
		return {
			success: false,
			message: "Network error. Please check your connection and try again.",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
