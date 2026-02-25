import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../../pages/LoginPage';

Given('I am on the login page', async function(this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigateToLogin();
});

When('I login with email {string} and password {string}', async function(this: CustomWorld, email: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(email, password);
});

Then('I should see the jobs listings page', async function(this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/jobs/);
});

// Then('the navigation should show my email', async function(this: CustomWorld) {
  // Add assertion for email visibility in nav
  // Example: await expect(this.page.locator('nav')).toContainText('test@example.com');
// });