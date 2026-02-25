import "dotenv/config";
import { test, expect } from '../fixtures/fixture';

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigateToLogin();
  });

  test('should successfully login with valid credentials', async ({ loginPage, page }) => {
    await expect(page.locator('h1:has-text("Welcome Back")')).toBeVisible();
    await loginPage.login('applicant@example.com', process.env.PLAYWRIGHT_PASSWORD!);
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('should display error message on invalid login', async ({ loginPage }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBe('Invalid email or password. Please try again.');
  });

 test('should toggle password visibility and still login successfully', async ({ loginPage, page }) => {
    await loginPage.fillPassword('password123');
    await loginPage.togglePasswordVisibility();
    const inputType = await loginPage.getPasswordInputType();
    expect(inputType).toBe('text');
    
    // Clear and fill with actual credentials while visibility is toggled
    await loginPage.passwordInput.clear();
    await loginPage.login('applicant@example.com', process.env.PLAYWRIGHT_PASSWORD!);
    
    // Verify successful login
    await expect(page).toHaveURL(/\/jobs/);
  });
});