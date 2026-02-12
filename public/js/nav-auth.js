// Navigation authentication UI handler
// Updates navigation bar based on user authentication state

document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('registerButton');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    // Check if required elements exist
    if (!registerButton || !loginButton || !logoutButton || !userInfo || !userEmailDisplay) {
        console.warn('Navigation auth elements not found');
        return;
    }
    
    // Attach logout handler
    if (logoutBtn && typeof logout === 'function') {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Update UI based on authentication state
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
        const email = getUserEmail();
        
        // Hide auth buttons, show logout and user info
        registerButton.classList.add('hidden');
        loginButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        
        if (email) {
            userInfo.classList.remove('hidden');
            userEmailDisplay.textContent = email;
        }
    } else {
        // Show auth buttons, hide logout and user info
        registerButton.classList.remove('hidden');
        loginButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        userInfo.classList.add('hidden');
    }
});
