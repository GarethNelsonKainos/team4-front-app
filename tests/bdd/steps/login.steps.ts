import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CustomWorld } from '../support/world';
import { createTestUser } from '../support/testUser';

Given('I am on the login page', async function(this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigateToLogin();
});

When('I login with email {string} and password {string}', async function(this: CustomWorld, email: string, password: string) {
  const loginPage = new LoginPage(this.page);
  const testUser = this.testUser ?? createTestUser();
  const resolvedEmail = email === 'generated' ? testUser.email : email;
  const resolvedPassword = password === 'generated' ? testUser.password : password;
  if (email === 'generated' || password === 'generated') {
    this.testUser = testUser;
  }
  await loginPage.fillEmail(resolvedEmail);
  await loginPage.fillPassword(resolvedPassword);
  await Promise.all([
    this.page.waitForURL(/\/jobs/, { timeout: 10000 }),
    loginPage.clickSignIn()
  ]);
});

Then('I should see the jobs listings page', async function(this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/jobs/, { timeout: 10000 });
});
