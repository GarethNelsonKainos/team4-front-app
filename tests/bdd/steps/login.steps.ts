import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
 
let page: Page;
let loginPage: LoginPage;
 
Given('I am on the login page', async function() {
  loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
});
 
When('I login with email {string} and password {string}', async function(email: string, password: string) {
  await loginPage.login(email, password);
});
 
Then('I should see the jobs listings page', async function() {
  await expect(page).toHaveURL(/\/jobs/);
});
 
Then('the navigation should show my email', async function() {
  // Add assertion for email visibility in nav
});