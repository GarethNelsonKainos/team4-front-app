import { test, expect } from '../fixtures/fixture';

test.describe('Jobs Page', () => {
  test.beforeEach(async ({ jobsPage, page }) => {
    await page.context().addInitScript(() => {
      window.localStorage.clear();
    });
    await jobsPage.navigate();
  });

  test('should display page with job listings', async ({ jobsPage }) => {
    const isLoaded = await jobsPage.isPageLoaded();
    expect(isLoaded).toBe(true);

    const titleText = await jobsPage.getPageTitleText();
    expect(titleText).toBe('Available Job Roles');
    
    const count = await jobsPage.getOpenPositionsCount();
    expect(count).toMatch(/\d+ Open Positions/);
    
    const jobCount = await jobsPage.getVisibleJobCount();
    expect(jobCount).toBeGreaterThan(0);
  });

  test('should display and navigate to job details', async ({ jobsPage, page }) => {
    const jobNames = await jobsPage.getAllJobRoleNames();
    expect(jobNames.length).toBeGreaterThan(0);
    
    const details = await jobsPage.getJobDetails(jobNames[0]);
    expect(details).not.toBeNull();
    expect(details?.roleName).toBe(jobNames[0]);
    expect(details?.location).toBeTruthy();
    
    await jobsPage.clickJobRole(jobNames[0]);
    await page.waitForURL(/\/job-roles\/\d+/);
    expect(page.url()).toMatch(/\/job-roles\/\d+/);
  });

  test('should save and toggle job save state', async ({ jobsPage, page }) => {
    const jobNames = await jobsPage.getAllJobRoleNames();
    expect(jobNames.length).toBeGreaterThan(0);
    const jobName = jobNames[0];
    
    // Save job
    await jobsPage.saveJob(jobName);
    let isSaved = await jobsPage.isJobSaved(jobName);
    expect(isSaved).toBe(true);
    
    // Unsave job
    await jobsPage.saveJob(jobName);
    isSaved = await jobsPage.isJobSaved(jobName);
    expect(isSaved).toBe(false);
  });
});
