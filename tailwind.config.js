/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,ts,njk}", "./views/**/*.njk"],
	theme: {
		extend: {
			colors: {
				kainos: {
					50: "#f0f9ff",
					100: "#e1f5fe",
					200: "#b3e5fc",
					300: "#81d4fa",
					400: "#41679f", // Kainos mid blue
					500: "#283583", // Official Kainos blue
					600: "#1e2a5e", // Darker Kainos blue
					700: "#15203f", 
					800: "#0d1629",
					900: "#060b14",
				},
				'kainos-green': {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#61a83f", // Official Kainos green
					600: "#4d8532",
					700: "#3d6b28",
					800: "#2d501e",
					900: "#1e3515",
				},
				'kainos-dark-green': {
					500: "#004631", // Official Kainos dark green
				},
				'kainos-grey': {
					500: "#575756", // Official Kainos grey
				},
				'kainos-orange': {
					500: "#ec6608", // Official Kainos orange
				},
				'kainos-bright-green': {
					500: "#cfd600", // Official Kainos bright green
				},
				'kainos-bright-blue': {
					500: "#009fe3", // Official Kainos bright blue
				},
			},
		},
	},
	plugins: [],
};
