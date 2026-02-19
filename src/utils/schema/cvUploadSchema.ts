import * as yup from "yup";

/**
 * CV upload validation schema
 * Defines the rules for file format and size validation
 * Used as documentation and reference for client-side and server-side validation
 */

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FORMATS = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export const cvUploadSchema = yup.object().shape({
	cv: yup
		.mixed<File>()
		.required("CV file is required")
		.test("fileSize", `File size must not exceed ${MAX_FILE_SIZE_MB} MB`, (file) => {
			if (!file) return false;
			return file.size <= MAX_FILE_SIZE_BYTES;
		})
		.test("fileFormat", "Invalid file format. Please upload a PDF or Word document (DOC/DOCX).", (file) => {
			if (!file) return false;

			// Check extension
			const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
			if (!ALLOWED_EXTENSIONS.includes(extension)) {
				return false;
			}

			// Check MIME type (if available)
			if (file.type && !ALLOWED_FORMATS.includes(file.type)) {
				return false;
			}

			return true;
		}),
	jobRoleId: yup.number().required("Job role ID is required").positive("Job role ID must be a positive number"),
});

/**
 * Validation configuration constants
 * Use these on the client-side for validation messages and constraints
 */
export const cvValidationConfig = {
	MAX_FILE_SIZE_MB,
	MAX_FILE_SIZE_BYTES,
	ALLOWED_FORMATS,
	ALLOWED_EXTENSIONS,
	ERROR_MESSAGES: {
		FILE_REQUIRED: "CV file is required",
		FILE_TOO_LARGE: `File size must not exceed ${MAX_FILE_SIZE_MB} MB`,
		INVALID_FORMAT: "Invalid file format. Please upload a PDF or Word document (DOC/DOCX).",
		INVALID_JOB_ID: "Job role ID is required",
	},
} as const;

export default cvUploadSchema;
