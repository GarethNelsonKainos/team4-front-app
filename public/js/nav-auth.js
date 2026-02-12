/**
 * Navigation authentication UI handler
 * Updates navigation bar based on authentication state from server
 * All authentication is now handled server-side with HTTP-only cookies
 */

document.addEventListener("DOMContentLoaded", async () => {
	const registerButton = document.getElementById("registerButton");
	const loginButton = document.getElementById("loginButton");
	const logoutButton = document.getElementById("logoutButton");
	const logoutBtn = document.getElementById("logoutBtn");
	const userInfo = document.getElementById("userInfo");
	const userEmailDisplay = document.getElementById("userEmailDisplay");

	// Check if required elements exist
	if (
		!registerButton ||
		!loginButton ||
		!logoutButton ||
		!userInfo ||
		!userEmailDisplay
	) {
		console.warn("Navigation auth elements not found");
		return;
	}

	try {
		// Check authentication status from server
		const response = await fetch("/api/auth-status");
		const data = await response.json();

		if (data.isAuthenticated) {
			// Hide auth buttons, show logout
			registerButton.classList.add("hidden");
			loginButton.classList.add("hidden");
			logoutButton.classList.remove("hidden");
			userInfo.classList.remove("hidden");
			// userEmailDisplay.textContent = data.email || "User";

			// Attach logout handler
			if (logoutBtn) {
				logoutBtn.addEventListener("click", async () => {
					try {
						const logoutResponse = await fetch("/api/logout", {
							method: "POST",
						});
						const logoutData = await logoutResponse.json();
						if (logoutData.success) {
							window.location.href = logoutData.redirectUrl || "/";
						}
					} catch (error) {
						console.error("Logout error:", error);
					}
				});
			}
		} else {
			// Show auth buttons, hide logout and user info
			registerButton.classList.remove("hidden");
			loginButton.classList.remove("hidden");
			logoutButton.classList.add("hidden");
			userInfo.classList.add("hidden");
		}
	} catch (error) {
		console.error("Error checking authentication status:", error);
		// Default to showing login/register buttons on error
		registerButton.classList.remove("hidden");
		loginButton.classList.remove("hidden");
		logoutButton.classList.add("hidden");
		userInfo.classList.add("hidden");
	}
});
