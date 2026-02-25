import { test as base, Page } from '@playwright/test';
import { BasePage } from '../pages/basePage';
import { LoginPage } from '../pages/loginPage';
import { RegisterPage } from '../pages/registerPage';
import { JobsPage } from '../pages/jobsPage';
import { JobDetailPage } from '../pages/jobDetailPage';

type TestFixtures = {
  basePage: BasePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  jobsPage: JobsPage;
  jobDetailPage: JobDetailPage;
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
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },
  jobsPage: async ({ page }, use) => {
    const jobsPage = new JobsPage(page);
    await use(jobsPage);
  },
  jobDetailPage: async ({ page }, use) => {
    const jobDetailPage = new JobDetailPage(page);
    await use(jobDetailPage);
  },
});

export { expect } from '@playwright/test';
