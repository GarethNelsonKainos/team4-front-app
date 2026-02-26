import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { RegisterPage } from '../../pages/registerPage';

Given('I am on the register page', async function(this: CustomWorld) {
    const registerPage = new RegisterPage(this.page);
    await registerPage.navigateToRegister();
});

When('I register with email {string} and password {string} and confirmPassword {string} and acceptTerms {string} and click submit', async function(this: CustomWorld, email: string, password: string, confirmPassword: string, acceptTerms: string) {
    const registerPage = new RegisterPage(this.page);
    await registerPage.fillEmail("anything4712123@example.com");
    await registerPage.fillPassword(password);
    await registerPage.fillConfirmPassword(confirmPassword);
    if (acceptTerms.toLowerCase() === 'true') {
        await registerPage.acceptTerms();
    }
    await registerPage.submit();
    await registerPage.register({ email, password, confirmPassword, acceptTerms: acceptTerms.toLowerCase() === 'true' });
});

Then('I should see the login page', async function(this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login/);
});