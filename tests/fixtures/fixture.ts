import { test as base, Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { LoginPage } from '../pages/LoginPage';

type TestFixtures = {
  basePage: BasePage;
  loginPage: LoginPage;
};

export const test = base.extend<TestFixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },

    loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';