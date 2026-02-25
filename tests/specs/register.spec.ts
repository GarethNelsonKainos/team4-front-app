import { test, expect } from '../fixtures/fixture';
import { RegisterPage } from '../pages/registerPage';
import { registerUsers } from '../fixtures/register-users';

test.describe('Register', () => {
  test('user can register with valid details', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.valid();

    await registerPage.register(user);

    await expect(page).toHaveURL(/\/login/);
    const isSuccessRedirectHeadingVisible = await registerPage.isSuccessRedirectHeadingVisible();
    expect(isSuccessRedirectHeadingVisible).toBe(true);
  });

  test('shows error for mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.mismatchPassword();

    await registerPage.register(user);

    const isPasswordMismatchErrorVisible = await registerPage.isPasswordMismatchErrorVisible();
    expect(isPasswordMismatchErrorVisible).toBe(true);
  });

});