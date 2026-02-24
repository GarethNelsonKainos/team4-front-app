import { test, expect } from '../fixtures/fixture';
import { RegisterPage } from '../pages/registerPage';
import { registerUsers } from '../fixtures/register-users';

test.describe('Register', () => {
  test('user can register with valid details', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.valid();

    await registerPage.register(user);

    await registerPage.expectSuccessRedirect();
  });

  test('shows error for mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.mismatchPassword();

    await registerPage.register(user);

    await registerPage.expectPasswordMismatchError();
  });

  test('requires terms acceptance', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.valid();
    user.acceptTerms = false;

    await registerPage.register(user);

    // If terms not accepted, we should still be on /register (form didn't submit)
    await expect(page).toHaveURL(/\/register/);
    // And the submit button should still be visible (form didn't go anywhere)
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('toggles password visibility', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillPassword('TestPass1!');

    await expect(registerPage.passwordInput()).toHaveAttribute('type', 'password');
    
    await registerPage.togglePasswordVisibility();
    await expect(registerPage.passwordInput()).toHaveAttribute('type', 'text');
  });
});