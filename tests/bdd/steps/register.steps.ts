import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Given("I am on the register page", async function (this: CustomWorld) {
  await this.registerPage.navigateToRegister();
});

When(
  "I register with email {string} and password {string} and confirmPassword {string} and acceptTerms {string} and click submit",
  async function (
    this: CustomWorld,
    email: string,
    password: string,
    confirmPassword: string,
    acceptTerms: string,
  ) {
    await this.registerPage.fillEmail(email);
    await this.registerPage.fillPassword(password);
    await this.registerPage.fillConfirmPassword(confirmPassword);
    if (acceptTerms.toLowerCase() === "true") {
      await this.registerPage.acceptTerms();
    }
    await this.registerPage.submit();
  },
);

Then("I should see the login page", async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login/);
});
