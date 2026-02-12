/**
 * Simple form handler that submits forms to the server
 * All API communication happens on the server-side, not in the browser
 * Production-ready: handles error page redirects from server
 */

document.addEventListener("DOMContentLoaded", () => {
	// Handle form submission - either login or register form
	const form = document.querySelector("form");

	if (form) {
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const formData = new FormData(form);
			const data = Object.fromEntries(formData);

			// Disable submit button during request
			const submitButton = form.querySelector('button[type="submit"]');
			if (submitButton) {
				submitButton.disabled = true;
				const originalText = submitButton.textContent;
				submitButton.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Processing...';
			}

			try {
				const response = await fetch(form.action || window.location.pathname, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});

				const result = await response.json();

				// Production: server provides redirectUrl for both success and error cases
				if (result.redirectUrl) {
					window.location.href = result.redirectUrl;
				} else if (result.success) {
					// Fallback: if no redirectUrl but success, go to home
					window.location.href = "/";
				} else {
					// Fallback: if no redirectUrl and failed, show generic error
					window.location.href = "/error";
				}
			} catch (error) {
				// Network error - redirect to generic error page
				console.error("Network error:", error);
				window.location.href = "/error";
			}
		});
	}
});
