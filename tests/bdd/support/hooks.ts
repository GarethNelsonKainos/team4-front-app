import { Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { RegisterPage } from "../../pages/registerPage";
import { createTestUser } from "./testUser";
import { CustomWorld } from "./world";

setDefaultTimeout(15000);

Before(async function (this: CustomWorld) {
  await this.init();
});

Before({ tags: "@needs_registered_user" }, async function (this: CustomWorld) {
  const testUser = createTestUser();
  this.testUser = testUser;
  const { email, password } = testUser;
  const registerPage = new RegisterPage(this.page);
  await registerPage.navigateToRegister();
  await registerPage.fillEmail(email);
  await registerPage.fillPassword(password);
  await registerPage.fillConfirmPassword(password);
  await registerPage.acceptTerms();
  await Promise.all([
    this.page.waitForURL(/\/(login|jobs)/, { timeout: 10000 }),
    registerPage.submit()
  ]);
});

After(async function (this: CustomWorld) {
  await this.cleanup();
});