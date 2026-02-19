import * as yup from "yup";

export const registrationSchema = yup.object().shape({
	email: yup
		.string()
		.email("Enter a valid email address")
		.required("Email is required"),
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.matches(/[0-9]/, "Password must include a number and special character")
		.matches(
			/[!@#$%^&*]/,
			"Password must include a number and special character",
		)
		.required("Password is required"),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref("password")], "Passwords do not match")
		.required("Please confirm your password"),
});

export const loginSchema = yup.object().shape({
	email: yup
		.string()
		.email("Enter a valid email address")
		.required("Email is required"),
	password: yup.string().required("Password is required"),
});
