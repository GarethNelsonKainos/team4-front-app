// Password visibility toggle functionality
const togglePasswordBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eyeIcon = document.getElementById("eyeIcon");

const toggleConfirmPasswordBtn = document.getElementById(
  "toggleConfirmPassword",
);
const confirmPasswordInput = document.getElementById("confirmPassword");
const eyeIconConfirm = document.getElementById("eyeIconConfirm");

if (togglePasswordBtn && passwordInput && eyeIcon) {
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeIcon.style.color = isPassword ? "#9CA3AF" : "#3B82F6";
  });
}

if (toggleConfirmPasswordBtn && confirmPasswordInput && eyeIconConfirm) {
  toggleConfirmPasswordBtn.addEventListener("click", () => {
    const isPassword = confirmPasswordInput.type === "password";
    confirmPasswordInput.type = isPassword ? "text" : "password";
    eyeIconConfirm.style.color = isPassword ? "#9CA3AF" : "#3B82F6";
  });
}
