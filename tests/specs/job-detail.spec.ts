import { test, expect } from '../fixtures/fixture';
import type { Page } from '../fixtures/fixture';
import { JobDetailPage } from '../pages/jobDetailPage';
import { JobsPage } from '../pages/jobsPage';

test.describe('Job Detail Page', () => {
  // Use a known job ID for testing - adjust as needed based on your data
  const testJobId = 1;

  test.beforeEach(async ({ page }: { page: Page }) => {
    const jobDetailPage = new JobDetailPage(page);
    await jobDetailPage.navigate(testJobId);
  });

  test('should display complete job details', async ({ page }: { page: Page }) => {
    const jobDetailPage = new JobDetailPage(page);
    const details = await jobDetailPage.getAllJobDetails();
    
    expect(details.title).toBeTruthy();
    expect(details.location).toBeTruthy();
    expect(details.capability).toBeTruthy();
    expect(details.band).toBeTruthy();
    expect(details.closingDate).toBeTruthy();
    expect(details.description).toBeTruthy();
    expect(details.responsibilities.length).toBeGreaterThan(0);
    
    await expect(jobDetailPage.saveButton).toBeVisible();
  });

  test('should navigate between jobs and job detail pages', async ({ page }: { page: Page }) => {
    const jobDetailPage = new JobDetailPage(page);
    // Navigate back to jobs
    await jobDetailPage.clickBackToJobRoles();
    await page.waitForURL('/jobs');
    expect(page.url()).toContain('/jobs');
    
    // Navigate back to detail
    await page.goBack();
    
    // Navigate to filtered jobs by capability
    await jobDetailPage.clickMoreCapabilityRoles();
    await page.waitForURL(/\/jobs\?capability=/);
    expect(page.url()).toContain('capability=');
  });

  test('should save job and persist in localStorage', async ({ page }: { page: Page }) => {
        // Start with clean localStorage for this test
        await page.evaluate(() => {
          try {
            window.localStorage.clear();
          } catch (e) {
            // localStorage might not be available on this page
          }
        });
    const jobDetailPage = new JobDetailPage(page);
    // Initial state
    let isSaved = await jobDetailPage.isJobSaved();
    expect(isSaved).toBe(false);
    let buttonText = await jobDetailPage.getSaveButtonText();
    expect(buttonText).toBe('Save for Later');
    
    // Save job
    await jobDetailPage.clickSaveButton();
    isSaved = await jobDetailPage.isJobSaved();
    expect(isSaved).toBe(true);
    buttonText = await jobDetailPage.getSaveButtonText();
    expect(buttonText).toBe('Saved');
    
    // Unsave job
    await jobDetailPage.clickSaveButton();
    isSaved = await jobDetailPage.isJobSaved();
    expect(isSaved).toBe(false);
    buttonText = await jobDetailPage.getSaveButtonText();
    expect(buttonText).toBe('Save for Later');
  });
});

test.describe('Job Detail Page - Integration', () => {
  test('should navigate from jobs list to detail and back', async ({ page }: { page: Page }) => {
    const jobsPage = new JobsPage(page);
    const jobDetailPage = new JobDetailPage(page);
    
    await jobsPage.navigate();
    const jobNames = await jobsPage.getAllJobRoleNames();
    
    expect(jobNames.length).toBeGreaterThan(0);
    
    // Navigate to detail
    await jobsPage.clickJobRole(jobNames[0]);
    await page.waitForURL(/\/job-roles\/\d+/);
    
    const isLoaded = await jobDetailPage.isPageLoaded();
    expect(isLoaded).toBe(true);
    
    const title = await jobDetailPage.getJobTitle();
    expect(title).toBe(jobNames[0]);
    
    // Navigate back
    await jobDetailPage.clickBackToJobRoles();
    await page.waitForURL('/jobs');
    
    const isJobsPageLoaded = await jobsPage.isPageLoaded();
    expect(isJobsPageLoaded).toBe(true);
  });
});
