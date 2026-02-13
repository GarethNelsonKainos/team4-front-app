/**
 * Simple form handler that submits forms to the server
 * All API communication happens on the server-side, not in the browser
 * Shows error messages inline on failed login/registration, redirects on success
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

				// Clear any previous error messages
				const errorContainer = form.querySelector("[data-error-message]");
				if (errorContainer) {
					errorContainer.textContent = "";
					errorContainer.classList.add("hidden");
				}

				// Handle error response with message
				if (!result.success && result.message) {
					// Display error message inline instead of redirecting
					if (errorContainer) {
						errorContainer.textContent = result.message;
						errorContainer.classList.remove("hidden");
					}
					// Re-enable submit button so user can try again
					if (submitButton) {
						submitButton.disabled = false;
						const buttonText = form.id === "loginForm" ? "Sign In" : "Create Account";
						submitButton.innerHTML = buttonText;
					}
					return;
				}

				// Production: server provides redirectUrl for success cases
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
				// Network error - display message but don't redirect
				console.error("Network error:", error);
				const errorContainer = form.querySelector("[data-error-message]");
				if (errorContainer) {
					errorContainer.textContent = "Network error. Please check your connection";
					errorContainer.classList.remove("hidden");
				}
				// Re-enable submit button
				if (submitButton) {
					submitButton.disabled = false;
					const buttonText = form.id === "loginForm" ? "Sign In" : "Create Account";
					submitButton.innerHTML = buttonText;
				}
			}
		});
	}
});
