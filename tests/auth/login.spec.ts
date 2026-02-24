import { test, expect } from '../fixtures/fixture';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigateToLogin();
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1:has-text("Welcome Back")')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ loginPage}) => {
    await loginPage.login('applicant@example.com', 'ChangeMe123!');
    // Add assertion for successful login redirect
  });

  test('should display error message on invalid login', async ({ loginPage}) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.assertErrorMessageVisible('Invalid email or password. Please try again.');
  });

  test('should toggle password visibility', async ({ loginPage}) => {
    await loginPage.fillPassword('password123');
    await loginPage.togglePasswordVisibility();
    const inputType = await loginPage.getPasswordInputType();
    expect(inputType).toBe('text');
  });
});