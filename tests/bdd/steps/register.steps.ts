import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { RegisterPage } from '../../pages/registerPage';
import { createTestUser } from '../support/testUser';

Given('I am on the register page', async function(this: CustomWorld) {
    const registerPage = new RegisterPage(this.page);
    await registerPage.navigateToRegister();
});

When('I register with email {string} and password {string} and confirmPassword {string} and acceptTerms {string} and click submit', async function(this: CustomWorld, email: string, password: string, confirmPassword: string, acceptTerms: string) {
    const registerPage = new RegisterPage(this.page);
    let testUser = this.testUser;
    if ((email === 'generated' || password === 'generated' || confirmPassword === 'generated') && !testUser) {
        testUser = createTestUser();
        this.testUser = testUser;
    }
    if (!testUser && (email === 'generated' || password === 'generated' || confirmPassword === 'generated')) {
        throw new Error('testUser is not set. Use @needs_registered_user tag to automatically create a registered user.');
    }
    const resolvedEmail = email === 'generated' ? testUser!.email : email;
    const resolvedPassword = password === 'generated' ? testUser!.password : password;
    const resolvedConfirmPassword = confirmPassword === 'generated' ? testUser!.password : confirmPassword;
    await registerPage.fillEmail(resolvedEmail);
    await registerPage.fillPassword(resolvedPassword);
    await registerPage.fillConfirmPassword(resolvedConfirmPassword);
    if (acceptTerms.toLowerCase() === 'true') {
        await registerPage.acceptTerms();
    }
    await Promise.all([
        this.page.waitForURL(/\/(login|jobs)/, { timeout: 10000 }),
        registerPage.submit()
    ]);
});

Then('I should see the login page', async function(this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login/, { timeout: 10000 });
});