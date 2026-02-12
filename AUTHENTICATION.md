# Authentication Setup Guide

## Overview
This frontend application now connects to the backend API for user authentication. The login and registration system uses JWT (JSON Web Tokens) stored in localStorage for maintaining user sessions.

## Backend Configuration
- Backend API runs on: `http://localhost:8080`
- Register endpoint: `POST /api/register`
- Login endpoint: `POST /api/login`
- Protected endpoints require authentication via JWT token

## Environment Variables
Create a `.env` file in the frontend root with:
```env
PORT=3000
API_BASE_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

**Important:** The `API_BASE_URL` is automatically passed from the server to client-side JavaScript via a global variable `window.API_BASE_URL`. This makes it easy to switch between development, staging, and production environments by simply updating the `.env` file.

## How It Works

### 1. Registration Flow
1. User enters email, password, and confirms password on `/register` page
2. Frontend validates input (email format, password length, passwords match)
3. Frontend sends POST request to `http://localhost:8080/api/register`
4. Backend creates user account with hashed password
5. User is redirected to `/login` page to sign in

### 3. Authentication Check
1. User enters email and password on `/login` page
2. Frontend sends POST request to `http://localhost:8080/api/login`
3. Backend validates credentials and returns JWT token
4. Frontend stores token in `localStorage`
5. User is redirected to `/jobs` page

### 3. Authentication Check
The navigation bar automatically detects if a user is logged in by checking for the JWT token in localStorage. It shows Register/Login buttons when logged out, and user email/Logout button when logged in.

### 4. Making Authenticated Requests
Use the `authenticatedFetch()` helper function from `/js/auth.js`:

```javascript
// Example: Fetch protected job roles from backend
async function getJobRoles() {
    try {
        const apiUrl = getApiBaseUrl();
        const response = await authenticatedFetch(`${apiUrl}/api/job-roles`);
        const data = await response.json();
        console.log('Job roles:', data);
        return data;
    } catch (error) {
        console.error('Error fetching job roles:', error);
    }
}
```

### 5. Logout
Call the `logout()` function from anywhere:
```javascript
logout(); // Clears token and redirects to login page
```

## Available Client-Side Functions

Located in `/public/js/auth.js`:

- `getApiBaseUrl()` - Get the API base URL from environment
- `isAuthenticated()` - Check if user is logged in
- `getAuthToken()` - Get the stored JWT token
- `getUserEmail()` - Get logged-in user's email
- `logout()` - Logout and redirect to login page
- `authenticatedFetch(url, options)` - Make authenticated API requests
- `requireAuth()` - Redirect to login if not authenticated

### Using the API Base URL

The API base URL is automatically available via `window.API_BASE_URL` or the helper function:

```javascript
const apiUrl = getApiBaseUrl(); // Returns value from .env
const response = await fetch(`${apiUrl}/api/job-roles`);
```

## Example: Protecting a Page

To require authentication for a page, add this to your JavaScript:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    requireAuth(); // Redirects to /login if not authenticated
    
    // Rest of your page logic...
});
```

## Testing the Authentication

1. **Start the backend server:**
   ```bash
   cd ../team4-back-app
   npm run dev
   ```

2. **Start the frontend server:**
   ```bash
   cd ../team4-front-app
   npm run dev
   ```

3. **Register a new user:**
   - Navigate to `http://localhost:3000/register`
   - Enter a valid email and password (min. 6 characters)
   - Confirm password and accept terms
   - Click "Create Account"
   - You'll be redirected to the login page

4. **Login with your new account:**
   - Enter your email and password on the login page
   - Click "Sign In"
   - You'll be redirected to the jobs page
   - Notice the navigation bar now shows your email and a logout button

5. **Test the flow:**
   - Try accessing protected resources with your authenticated session
   - Click logout and verify you're redirected to login
   - Try logging in again with your credentials
   - Attempt to register with an existing email (should show error)

## Security Notes

⚠️ **Important for Production:**
- Change JWT_SECRET to a strong, random value
- Use HTTPS in production
- Consider implementing refresh tokens for longer sessions
- Add CORS configuration on backend
- Implement rate limiting on login endpoint
- Add proper error logging and monitoring

## Next Steps

To protect backend endpoints:
1. Ensure backend has authentication middleware
2. Protected routes should verify JWT token
3. Return 401 Unauthorized for invalid tokens
4. Frontend automatically redirects to login on 401 responses
