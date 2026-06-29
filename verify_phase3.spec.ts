import { test, expect } from '@playwright/test';

const schoolSlug = 'st-andrews-college';
const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001';

test('verify communications hub and new modules', async ({ page }) => {
  // Mock API for school resolution
  await page.route(`**/api/v1/schools?search=${schoolSlug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        schools: [{
          id: 'school-123',
          schoolName: 'St Andrews College',
          slug: schoolSlug,
          theme: { value: '#059669' }
        }]
      })
    });
  });

  // Mock for directory
  await page.route('**/schools/school-123/directory', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        admins: [],
        teachers: [],
        parents: []
      })
    });
  });

  // Mock for conversations
  await page.route('**/api/v1/conversations', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // 1. Check Communications Hub
  await page.goto(`${baseUrl}/admin/${schoolSlug}/communications`);
  await expect(page.getByRole('heading', { name: 'Communications Hub' })).toBeVisible();
  await page.screenshot({ path: 'verify_communications.png', fullPage: true });

  // 2. Check Teacher CRM
  await page.goto(`${baseUrl}/admin/${schoolSlug}/teachers`);
  await expect(page.getByRole('heading', { name: 'Teacher Management' })).toBeVisible();

  // Test drawer
  await page.getByText('View Profile').first().click();
  await expect(page.getByRole('heading', { name: 'Employment Details' })).toBeVisible();
  await page.screenshot({ path: 'verify_teachers_drawer.png' });
  await page.getByRole('button').filter({ has: page.locator('svg.lucide-x') }).click();

  await page.screenshot({ path: 'verify_teachers_phase3.png', fullPage: true });

  // 3. Check Subjects
  await page.goto(`${baseUrl}/admin/${schoolSlug}/subjects`);
  await expect(page.getByRole('heading', { name: 'Subject Curriculum' })).toBeVisible();
  await page.screenshot({ path: 'verify_subjects.png', fullPage: true });

  // 4. Check Attendance
  await page.goto(`${baseUrl}/admin/${schoolSlug}/attendance`);
  await expect(page.getByRole('heading', { name: 'Attendance Tracking' })).toBeVisible();
  await page.screenshot({ path: 'verify_attendance.png', fullPage: true });
});
