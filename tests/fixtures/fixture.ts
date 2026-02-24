import { test as base, Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

type TestFixtures = {
  basePage: BasePage;
};

export const test = base.extend<TestFixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },
});

export { expect } from '@playwright/test';