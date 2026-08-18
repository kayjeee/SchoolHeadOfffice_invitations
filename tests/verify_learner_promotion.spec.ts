import { test, expect } from '@playwright/test';

test.describe('Learner Promotion System', () => {
  test('allows an admin to navigate to Management -> Promotion System and promote learners', async ({ page }) => {
    // Mock schools endpoint
    await page.route('**/api/v1/schools?search=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          schools: [{
            id: 'school-123',
            _id: 'school-123',
            schoolName: 'Kagiso High School',
            slug: 'kagiso-high-school'
          }]
        })
      });
    });

    // Mock grades endpoint
    await page.route('**/api/v1/schools/school-123/grades', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          grades: [
            { id: 'grade-10', _id: 'grade-10', name: 'Grade 10', level: 10 },
            { id: 'grade-11', _id: 'grade-11', name: 'Grade 11', level: 11 },
            { id: 'grade-12', _id: 'grade-12', name: 'Grade 12', level: 12 }
          ]
        })
      });
    });

    // Mock school learners endpoint
    await page.route('**/api/v1/schools/school-123/learners*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          learners: [
            { id: 'learner-1', _id: 'learner-1', full_name: 'Sibusiso Mokoena', admission_number: 'ADM-001', grade_id: 'grade-10', status: 'active' },
            { id: 'learner-2', _id: 'learner-2', full_name: 'Zinhle Ndlovu', admission_number: 'ADM-002', grade_id: 'grade-10', status: 'active' }
          ],
          total: 2
        })
      });
    });

    // Mock grade-10 learners endpoint
    await page.route('**/api/v1/schools/school-123/grades/grade-10/learners*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          learners: [
            { id: 'learner-1', _id: 'learner-1', full_name: 'Sibusiso Mokoena', admission_number: 'ADM-001', grade_id: 'grade-10', status: 'active' },
            { id: 'learner-2', _id: 'learner-2', full_name: 'Zinhle Ndlovu', admission_number: 'ADM-002', grade_id: 'grade-10', status: 'active' }
          ]
        })
      });
    });

    // Mock statistics endpoint
    await page.route('**/api/v1/learners/statistics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          total: 2,
          by_status: { active: 2 }
        })
      });
    });

    // Intercept promotion submit request
    let promotionPayload: any = null;
    await page.route('**/api/v1/schools/school-123/learners/promote', async (route) => {
      promotionPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Successfully promoted 2 learner(s) to Grade 11!'
        })
      });
    });

    // Navigate to learners directory page with bypassAuth
    await page.goto('http://localhost:3000/admin/kagiso-high-school/learners?bypassAuth=true');

    // Click on Management Hub tab
    await page.getByRole('button', { name: /Management Hub/i }).click();

    // Click on Manage Promotions
    await page.getByRole('button', { name: /Manage Promotions/i }).click();

    // Modal title should be visible
    await expect(page.getByText('Learner Promotion System')).toBeVisible();

    // Proceed to review
    await page.getByRole('button', { name: /Review Promotion/i }).click();

    // Confirm promotion
    await page.getByRole('button', { name: /Promote Learners/i }).click();

    // Check payload shape
    expect(promotionPayload).not.toBeNull();
    expect(promotionPayload.school_id).toBe('school-123');
    expect(promotionPayload.source_grade_id).toBe('grade-10');
    expect(promotionPayload.destination_grade_id).toBe('grade-11');
    expect(promotionPayload.learner_ids).toEqual(['learner-1', 'learner-2']);
  });
});
