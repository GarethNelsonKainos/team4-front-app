import { test, expect } from '../fixtures/fixture';

test.describe('Jobs Page', () => {
  test.beforeEach(async ({ jobsPage, page }) => {
    await jobsPage.navigate();
    await page.evaluate(() => localStorage.clear());
  });

  test('should display page with job listings', async ({ jobsPage }) => {
    await expect(jobsPage.pageTitle).toBeVisible();
    await expect(jobsPage.pageTitle).toHaveText('Available Job Roles');
    
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
    if (jobNames.length > 0) {
      const jobName = jobNames[0];
      
      // Save job
      await jobsPage.saveJob(jobName);
      let isSaved = await jobsPage.isJobSaved(jobName);
      expect(isSaved).toBe(true);
      
      // Verify localStorage
      let savedJobs = await page.evaluate(() => 
        JSON.parse(localStorage.getItem('savedJobs') || '[]')
      );
      expect(savedJobs.length).toBeGreaterThan(0);
      
      // Unsave job
      await jobsPage.saveJob(jobName);
      isSaved = await jobsPage.isJobSaved(jobName);
      expect(isSaved).toBe(false);
    }
  });

  test('should navigate to contact page', async ({ jobsPage, page }) => {
    await expect(jobsPage.getInTouchButton).toBeVisible();
    await jobsPage.clickGetInTouch();
    await page.waitForURL('/contact');
    expect(page.url()).toContain('/contact');
  });
});
