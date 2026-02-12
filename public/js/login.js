// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
        window.location.href = '/jobs';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = document.getElementById('eyeIcon');
            if (type === 'password') {
                eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
            } else {
                eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';
            }
        });
    }

    // Form validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        emailError.classList.add('hidden');
        passwordError.classList.add('hidden');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Client-side validation
        let hasError = false;

        if (!email) {
            emailError.textContent = 'Email is required';
            emailError.classList.remove('hidden');
            hasError = true;
        } else if (!validateEmail(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.classList.remove('hidden');
            hasError = true;
        }

        if (!password) {
            passwordError.textContent = 'Password is required';
            passwordError.classList.remove('hidden');
            hasError = true;
        } else if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordError.classList.remove('hidden');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        // Disable submit button during request
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
        `;

        try {
            // Send login request to backend API
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store JWT token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', email);
                
                // Show success message
                submitButton.innerHTML = `
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Success! Redirecting...
                `;
                submitButton.classList.add('bg-green-500', 'hover:bg-green-600');
                submitButton.classList.remove('bg-kainos-500', 'hover:bg-kainos-600');

                // Redirect to jobs page after short delay
                setTimeout(() => {
                    window.location.href = '/jobs';
                }, 1000);
            } else {
                // Show error message from server
                showError(data.message || 'Login failed. Please try again.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Unable to connect to the server. Please try again later.');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });

    // Clear error messages when user starts typing
    emailInput.addEventListener('input', () => {
        emailError.classList.add('hidden');
        hideError();
    });

    passwordInput.addEventListener('input', () => {
        passwordError.classList.add('hidden');
        hideError();
    });
});
