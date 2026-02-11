/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,ts,njk}", "./src/templates/**/*.njk"],
	theme: {
		extend: {
			colors: {
				kainos: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#61A83F", // Your brand color
					600: "#569137", // Darker shade for hover states
					700: "#4b7f31", // Even darker for active states
					800: "#3d6627",
					900: "#2f4e1d",
				},
			},
		},
	},
	plugins: [],
};
