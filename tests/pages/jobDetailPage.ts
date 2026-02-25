import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class JobDetailPage extends BasePage {
  // Page elements
  readonly jobTitle: Locator;
  readonly locationBadge: Locator;
  readonly capabilityBadge: Locator;
  readonly bandBadge: Locator;
  readonly saveButton: Locator;
  readonly applyButton: Locator;
  readonly openPositionsText: Locator;
  readonly closingDateText: Locator;
  readonly descriptionSection: Locator;
  readonly descriptionText: Locator;
  readonly viewSpecificationLink: Locator;
  readonly responsibilitiesSection: Locator;
  readonly responsibilitiesList: Locator;
  readonly viewAllJobsLink: Locator;
  readonly moreCapabilityRolesLink: Locator;
  readonly backToJobRolesLink: Locator;

  constructor(page: Page) {
    super(page);
    this.jobTitle = page.locator('h1');
    this.locationBadge = page.locator('.bg-kainos-50');
    this.capabilityBadge = page.locator('.bg-gray-50').locator('svg').first().locator('..');
    this.bandBadge = page.locator('.bg-gray-50').nth(1);
    this.saveButton = page.locator('.save-btn');
    this.applyButton = page.locator('.apply-btn');
    this.openPositionsText = page.locator('text=/\\d+ position/');
    this.closingDateText = page.locator('div.text-base.text-gray-600:has-text("Closing Date:")');
    this.descriptionSection = page.locator('h2:has-text("Description")').locator('..');
    this.descriptionText = this.descriptionSection.locator('p').first();
    this.viewSpecificationLink = page.getByRole('link', { name: /View Full Job Specification/ });
    this.responsibilitiesSection = page.locator('h2:has-text("Key Responsibilities")').locator('..');
    this.responsibilitiesList = this.responsibilitiesSection.locator('ul li');
    this.viewAllJobsLink = page.getByRole('link', { name: 'View All Jobs' });
    this.moreCapabilityRolesLink = page.locator('a[href*="capability"]');
    this.backToJobRolesLink = page.getByRole('link', { name: 'Back to Job Roles' });
  }

  /**
   * Navigate to a specific job detail page
   */
  async navigate(jobId: number) {
    await this.goto(`/job-roles/${jobId}`);
  }

  /**
   * Get the job title
   */
  async getJobTitle(): Promise<string> {
    const text = await this.jobTitle.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the location
   */
  async getLocation(): Promise<string> {
    const text = await this.locationBadge.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the capability
   */
  async getCapability(): Promise<string> {
    const text = await this.capabilityBadge.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the band
   */
  async getBand(): Promise<string> {
    const text = await this.bandBadge.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the closing date
   */
  async getClosingDate(): Promise<string> {
    const text = await this.closingDateText.textContent();
    if (!text) return '';
    
    // Extract just the date part after "Closing Date:"
    const match = text.match(/Closing Date:\s*(.+)/);
    return match && match[1] ? match[1].trim() : '';
  }

  /**
   * Get the number of open positions
   */
  async getOpenPositionsCount(): Promise<string> {
    try {
      const text = await this.openPositionsText.textContent();
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  /**
   * Get the job description
   */
  async getDescription(): Promise<string> {
    const text = await this.descriptionText.textContent();
    return text?.trim() || '';
  }

  /**
   * Get all responsibilities
   */
  async getResponsibilities(): Promise<string[]> {
    const count = await this.responsibilitiesList.count();
    const responsibilities: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await this.responsibilitiesList.nth(i).textContent();
      if (text) responsibilities.push(text.trim());
    }
    
    return responsibilities;
  }

  /**
   * Click the save button
   */
  async clickSaveButton() {
    await this.saveButton.click();
  }

  /**
   * Check if the job is saved (heart icon is filled)
   */
  async isJobSaved(): Promise<boolean> {
    const heartIcon = this.saveButton.locator('.heart-icon');
    const fillValue = await heartIcon.getAttribute('fill');
    return fillValue !== 'none';
  }

  /**
   * Get the save button text
   */
  async getSaveButtonText(): Promise<string> {
    const text = await this.saveButton.locator('.save-text').textContent();
    return text?.trim() || '';
  }

  /**
   * Click the Apply Now button
   */
  async clickApplyButton() {
    await this.applyButton.click();
  }

  /**
   * Check if the Apply Now button is visible
   */
  async isApplyButtonVisible(): Promise<boolean> {
    try {
      return await this.applyButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Click the View Full Job Specification link
   */
  async clickViewSpecification() {
    await this.viewSpecificationLink.click();
  }

  /**
   * Check if the View Full Job Specification link is visible
   */
  async isViewSpecificationVisible(): Promise<boolean> {
    try {
      return await this.viewSpecificationLink.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Click View All Jobs link
   */
  async clickViewAllJobs() {
    await this.viewAllJobsLink.click();
  }

  /**
   * Click More [Capability] Roles link
   */
  async clickMoreCapabilityRoles() {
    await this.moreCapabilityRolesLink.click();
  }

  /**
   * Click Back to Job Roles button
   */
  async clickBackToJobRoles() {
    await this.backToJobRolesLink.click();
  }

  /**
   * Check if the page is loaded
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.jobTitle.isVisible();
  }

  /**
   * Get all job details
   */
  async getAllJobDetails(): Promise<{
    title: string;
    location: string;
    capability: string;
    band: string;
    closingDate: string;
    openPositions: string;
    description: string;
    responsibilities: string[];
  }> {
    return {
      title: await this.getJobTitle(),
      location: await this.getLocation(),
      capability: await this.getCapability(),
      band: await this.getBand(),
      closingDate: await this.getClosingDate(),
      openPositions: await this.getOpenPositionsCount(),
      description: await this.getDescription(),
      responsibilities: await this.getResponsibilities(),
    };
  }

  /**
   * Toggle save state (click save button twice)
   */
  async toggleSave() {
    const initialState = await this.isJobSaved();
    await this.clickSaveButton();
    // Wait for the save state to change
    const heartIcon = this.saveButton.locator('.heart-icon');
    const expectedFill = initialState ? 'none' : 'currentColor';
    await this.page.waitForFunction(
      async () => {
        const fill = await heartIcon.evaluate((el) => el.getAttribute('fill'));
        return fill === expectedFill;
      }
    );
    return !initialState;
  }
}
