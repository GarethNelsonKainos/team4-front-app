import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class JobsPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly openPositionsCount: Locator;
  readonly jobTable: Locator;
  readonly jobCards: Locator;
  readonly getInTouchButton: Locator;
  readonly jobLinks: Locator;
  readonly jobTableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: 'Available Job Roles' });
    this.openPositionsCount = page.locator('.bg-green-600 .text-white');
    this.jobTable = page.locator('table.min-w-full');
    this.jobCards = page.locator('.lg\\:hidden > div');
    this.getInTouchButton = page.getByRole('link', { name: 'Get in Touch' });
    this.jobLinks = page.locator('table tbody a[href^="/job-roles/"]');
    this.jobTableRows = page.locator('table tbody tr');
  }

  /**
   * Navigate to the jobs page
   */
  async navigate() {
    await this.goto('/job-roles');
  }

  /**
   * Get the total number of open positions displayed
   */
  async getOpenPositionsCount(): Promise<string> {
    const text = await this.openPositionsCount.textContent();
    return text?.trim() || '0';
  }

  /**
   * Get all job role names from the table (desktop view)
   */
  async getAllJobRoleNames(): Promise<string[]> {
    const count = await this.jobLinks.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await this.jobLinks.nth(i).textContent();
      if (text) names.push(text.trim());
    }

    return names;
  }

  /**
   * Click on a job role by name
   */
  async clickJobRole(roleName: string) {
    await this.page.getByRole('link', { name: roleName }).first().click();
  }

  /**
   * Get job details by role name from the table
   */
  async getJobDetails(roleName: string): Promise<{
    roleName: string;
    location: string;
    capability: string;
    band: string;
    closingDate: string;
  } | null> {
    const row = this.page.locator('tr', {
      has: this.page.getByRole('link', { name: roleName })
    });

    if (await row.count() === 0) return null;

    return {
      roleName: roleName,
      location: (await row.locator('td').nth(1).textContent())?.trim() || '',
      capability: (await row.locator('td').nth(2).textContent())?.trim() || '',
      band: (await row.locator('td').nth(3).textContent())?.trim() || '',
      closingDate: (await row.locator('td').nth(4).textContent())?.trim() || '',
    };
  }

  /**
   * Click the save button for a specific job
   */
  async saveJob(roleName: string) {
    const row = this.page.locator('tr', {
      has: this.page.getByRole('link', { name: roleName })
    });
    await row.locator('.save-btn').click();
  }

  /**
   * Check if a job is saved (heart icon is filled)
   */
  async isJobSaved(roleName: string): Promise<boolean> {
    const row = this.page.locator('tr', {
      has: this.page.getByRole('link', { name: roleName })
    });
    const heartIcon = row.locator('.heart-icon');
    const fillValue = await heartIcon.getAttribute('fill');
    return fillValue !== 'none';
  }

  /**
   * Click the view button for a specific job
   */
  async viewJobDetails(roleName: string) {
    const row = this.page.locator('tr', {
      has: this.page.getByRole('link', { name: roleName })
    });
    await row.getByRole('link', { name: 'View' }).click();
  }

  /**
   * Filter jobs by location (if filtering functionality exists)
   */
  async filterByLocation(location: string) {
    await this.page.locator(`[data-filter-location="${location}"]`).click();
  }

  /**
   * Filter jobs by capability (if filtering functionality exists)
   */
  async filterByCapability(capability: string) {
    await this.page.locator(`[data-filter-capability="${capability}"]`).click();
  }

  /**
   * Check if the jobs page is loaded
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  /**
   * Get the number of visible jobs in the table
   */
  async getVisibleJobCount(): Promise<number> {
    return await this.jobTableRows.count();
  }

  /**
   * Click the "Get in Touch" button
   */
  async clickGetInTouch() {
    await this.getInTouchButton.click();
  }
}