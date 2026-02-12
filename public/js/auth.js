// Authentication helper functions for client-side

/**
 * Check if user is logged in
 * @returns {boolean} True if user has a valid token
 */
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token !== null && token !== undefined && token !== '';
}

/**
 * Get the stored authentication token
 * @returns {string|null} The JWT token or null if not found
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Get the logged in user's email
 * @returns {string|null} The user's email or null if not found
 */
function getUserEmail() {
    return localStorage.getItem('userEmail');
}

/**
 * Logout the current user
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
}

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} The fetch response
 */
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // If unauthorized, redirect to login
    if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
    }
}

// Export functions (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isAuthenticated,
        getAuthToken,
        getUserEmail,
        logout,
        authenticatedFetch,
        requireAuth
    };
}
