import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { cvUploadConfig } from "../utils/multerConfig.js";

type ConfigWithFileFilter = {
	limits: { fileSize: number };
	fileFilter: (
		req: Request,
		file: Express.Multer.File,
		callback: (error: Error | null, accepted: boolean) => void,
	) => void;
};

describe("Multer Config", () => {
	describe("cvUploadConfig", () => {
		it("should export cvUploadConfig", () => {
			expect(cvUploadConfig).toBeDefined();
		});

		it("should use memory storage", () => {
			expect(cvUploadConfig).toHaveProperty("storage");
		});

		it("should have file size limit of 5 MB", () => {
			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			expect(config.limits.fileSize).toBe(5 * 1024 * 1024);
		});

		it("should have fileFilter function", () => {
			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			expect(config).toHaveProperty("fileFilter");
			expect(typeof config.fileFilter).toBe("function");
		});
	});

	describe("fileFilter", () => {
		const mockRequest = {} as Request;
		let callbackResult: { error: Error | null; accepted: boolean } | null =
			null;

		const mockCallback = (error: Error | null, accepted: boolean) => {
			callbackResult = { error, accepted };
		};

		it("should accept PDF files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.pdf",
				encoding: "7bit",
				mimetype: "application/pdf",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(true);
			expect(callbackResult?.error).toBeNull();
		});

		it("should accept DOC files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.doc",
				encoding: "7bit",
				mimetype: "application/msword",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(true);
			expect(callbackResult?.error).toBeNull();
		});

		it("should accept DOCX files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.docx",
				encoding: "7bit",
				mimetype:
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(true);
			expect(callbackResult?.error).toBeNull();
		});

		it("should reject image files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "photo.jpg",
				encoding: "7bit",
				mimetype: "image/jpeg",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(false);
			expect(callbackResult?.error).toBeInstanceOf(Error);
			expect(callbackResult?.error?.message).toBe(
				"Invalid file type. Only PDF, DOC, DOCX allowed.",
			);
		});

		it("should reject text files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.txt",
				encoding: "7bit",
				mimetype: "text/plain",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(false);
			expect(callbackResult?.error).toBeInstanceOf(Error);
		});

		it("should reject zip files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "resume.zip",
				encoding: "7bit",
				mimetype: "application/zip",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(false);
			expect(callbackResult?.error).toBeInstanceOf(Error);
		});

		it("should reject executable files", () => {
			const mockFile = {
				fieldname: "cv",
				originalname: "malware.exe",
				encoding: "7bit",
				mimetype: "application/x-msdownload",
				size: 1024,
				stream: {} as NodeJS.ReadableStream,
				destination: "",
				filename: "",
				path: "",
				buffer: Buffer.from([]),
			} as Express.Multer.File;

			const config = cvUploadConfig as unknown as ConfigWithFileFilter;
			config.fileFilter(mockRequest, mockFile, mockCallback);

			expect(callbackResult?.accepted).toBe(false);
			expect(callbackResult?.error).toBeInstanceOf(Error);
		});
	});
});
