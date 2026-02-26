import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Given("I am on the login page", async function (this: CustomWorld) {
  await this.loginPage.navigateToLogin();
});

When(
  "I login with email {string} and password {string}",
  async function (this: CustomWorld, email: string, password: string) {
    await this.loginPage.login(email, password);
  },
);

Then("I should see the jobs listings page", async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/jobs/);
});
