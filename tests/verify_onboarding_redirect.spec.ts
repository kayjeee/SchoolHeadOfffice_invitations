import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow - Redirect after Completion', () => {
  const baseUrl = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // 1. Mock Auth0 session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'System Admin', email: 'admin@school.com', sub: 'admin-123' },
          accessToken: 'dummy-token'
        })
      });
    });

    // 2. Mock user roles
    await page.route('**/api/getUserRoles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ roles: [{ name: 'Admin' }] })
      });
    });

    // 3. Mock user's schools
    await page.route('**/api/v1/users/schools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            schools: [
              {
                id: 'school-123',
                _id: 'school-123',
                schoolName: 'Far North Secondary School',
                slug: 'far-north-secondary-school',
                logo: '',
                theme: '{"value":"#1e293b"}'
              }
            ]
          }
        })
      });
    });

    // 4. Mock onboarding status (incomplete to trigger onboarding flow)
    await page.route('**/api/v1/users/onboarding_status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            admin_onboarding_completed: false,
            parent_onboarding_completed: false,
            guest_onboarding_completed: false
          }
        })
      });
    });

    // 5. Mock school resolution for landing on the actual dashboard
    await page.route('**/api/v1/schools?search=far-north-secondary-school', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          schools: [
            {
              id: 'school-123',
              _id: 'school-123',
              schoolName: 'Far North Secondary School',
              slug: 'far-north-secondary-school'
            }
          ]
        })
      });
    });

    // Mock API for dashboard overview page
    await page.route('**/api/v1/schools/school-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'school-123',
          schoolName: 'Far North Secondary School',
          slug: 'far-north-secondary-school'
        })
      });
    });
  });

  test('should go through the onboarding steps and redirect to the correct school slug dashboard', async ({ page }) => {
    // Listen to console and page errors
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    await page.setViewportSize({ width: 1280, height: 1000 });

    // Navigate to /admin with auth bypass to start onboarding
    await page.goto(`${baseUrl}/admin?bypassAuth=true`);

    // Take screenshot and log page content after load
    await page.waitForTimeout(3000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- PAGE TEXT ---');
    console.log(bodyText);
    console.log('-----------------');
    await page.screenshot({ path: 'verify_onboarding_start_debug.png' });

    // Verify we are on Step 1: Create Grades
    await expect(page.getByText('Step 1 of 4')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Create Grades').first()).toBeVisible();

    // Click Next to go to Step 2 with exact match to avoid strict mode violations
    const nextBtn = page.getByRole('button', { name: 'Next Step →', exact: true });
    await nextBtn.click();

    // Verify Step 2
    await expect(page.getByText('Step 2 of 4')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Upload Learners').first()).toBeVisible();

    // Click Next to go to Step 3
    await nextBtn.click();

    // Verify Step 3
    await expect(page.getByText('Step 3 of 4')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Send Invites').first()).toBeVisible();

    // Click Next to go to Step 4 (Completion)
    await nextBtn.click();

    // Verify Step 4: Completion page
    await expect(page.getByText('Step 4 of 4')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Completion').first()).toBeVisible();
    await expect(page.getByText('Congratulations!')).toBeVisible();

    // Take screenshot of the final onboarding completion step
    await page.screenshot({ path: 'verify_onboarding_completion.png', fullPage: true });

    // Locate the Go to Dashboard button
    const goToDashboardBtn = page.getByRole('button', { name: 'Go to Dashboard' });
    await expect(goToDashboardBtn).toBeVisible();

    // Click Go to Dashboard and verify redirection URL
    await goToDashboardBtn.click();

    // Wait for the URL change or dashboard page loading
    await page.waitForURL('**/admin/dashboard/far-north-secondary-school', { timeout: 15000 });

    // Assert that the URL matches our expectation (without hardcoded school name in components!)
    expect(page.url()).toContain('/admin/dashboard/far-north-secondary-school');

    // Take screenshot of the loaded dashboard (proxied/rewritten from /admin/dashboard/far-north-secondary-school to /admin/far-north-secondary-school)
    await page.screenshot({ path: 'verify_dashboard_redirected.png', fullPage: true });

    // Verify that the dashboard header is visible
    await expect(page.getByText('School Dashboard')).toBeVisible();
    await expect(page.getByText('Far North Secondary School').first()).toBeVisible();
  });
});
