import { test, expect } from '../fixtures/fixture';
import { RegisterPage } from '../pages/registerPage';
import { registerUsers } from '../fixtures/register-users';

test.describe('Register', () => {
  test('user can register with valid details', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.valid();

    await registerPage.navigateToRegister();
    await registerPage.register(user);

    await registerPage.isAlreadyRegisteredHeadingVisible();
  });

  test('shows error for mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = registerUsers.mismatchPassword();

    await registerPage.register(user);

    await registerPage.isPasswordMismatchErrorVisible();
  });

});