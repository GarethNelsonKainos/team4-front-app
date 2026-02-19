import type { Request } from "express";
import multer, { type FileFilterCallback } from "multer";

/**
 * Multer file filter for CV uploads
 * Validates that only PDF, DOC, and DOCX files are accepted
 */
const fileFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback,
) => {
	const allowedTypes = [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only PDF, DOC, DOCX allowed."));
	}
};

/**
 * Shared multer configuration for CV uploads
 * - In-memory storage for efficiency
 * - 5 MB file size limit
 * - File type validation (PDF, DOC, DOCX only)
 */
export const cvUploadConfig = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB
	},
	fileFilter,
});
