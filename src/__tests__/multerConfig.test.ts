import type { Request } from "express";
import { describe, expect, it, vi } from "vitest";
import { cvUploadConfig } from "../utils/multerConfig.js";

describe("Multer Config - CV Upload", () => {
	describe("cvUploadConfig", () => {
		it("should export multer instance", () => {
			expect(cvUploadConfig).toBeDefined();
			expect(typeof cvUploadConfig).toBe("object");
		});

		it("should have single method for handling file upload", () => {
			expect(cvUploadConfig.single).toBeDefined();
			expect(typeof cvUploadConfig.single).toBe("function");
		});
	});

	describe("fileFilter", () => {
		it("should accept PDF files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// Access the fileFilter through the config
			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalledWith(null, true);
		});

		it("should accept DOC files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.doc",
				encoding: "7bit",
				mimetype: "application/msword",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalledWith(null, true);
		});

		it("should accept DOCX files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.docx",
				encoding: "7bit",
				mimetype:
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalledWith(null, true);
		});

		it("should reject JPG files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "photo.jpg",
				encoding: "7bit",
				mimetype: "image/jpeg",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalled();
			const error = mockCallback.mock.calls[0][0];
			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(
				"Invalid file type. Only PDF, DOC, DOCX allowed.",
			);
		});

		it("should reject TXT files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.txt",
				encoding: "7bit",
				mimetype: "text/plain",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalled();
			const error = mockCallback.mock.calls[0][0];
			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(
				"Invalid file type. Only PDF, DOC, DOCX allowed.",
			);
		});

		it("should reject executable files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "malware.exe",
				encoding: "7bit",
				mimetype: "application/x-msdownload",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalled();
			const error = mockCallback.mock.calls[0][0];
			expect(error).toBeInstanceOf(Error);
		});

		it("should reject ZIP files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "archive.zip",
				encoding: "7bit",
				mimetype: "application/zip",
			} as Express.Multer.File;

			const mockReq = {} as Request;
			const mockCallback = vi.fn();

			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			const fileFilter = storage.fileFilter;

			fileFilter(mockReq, mockFile, mockCallback);

			expect(mockCallback).toHaveBeenCalled();
			const error = mockCallback.mock.calls[0][0];
			expect(error).toBeInstanceOf(Error);
		});
	});

	describe("storage configuration", () => {
		it("should use memory storage", () => {
			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const storage = cvUploadConfig as any;
			expect(storage.storage).toBeDefined();
		});

		it("should have file size limit configured", () => {
			// biome-ignore lint/suspicious/noExplicitAny: Mock object requires flexible typing
			const limits = (cvUploadConfig as any).limits;
			expect(limits).toBeDefined();
			expect(limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
		});
	});
});
