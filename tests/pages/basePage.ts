import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '') {
    await this.page.goto(path);
  }

  async waitForLoadState(p0: string) {
    await this.page.waitForLoadState('networkidle');
  }
}