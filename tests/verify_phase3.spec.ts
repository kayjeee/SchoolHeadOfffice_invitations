import { test, expect } from '@playwright/test';

test.describe('Phase 3 Modules Verification', () => {
  const schoolSlug = 'st-andrews-college';
  const baseUrl = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Mock school resolution
    await page.route(`**/api/v1/schools?search=${schoolSlug}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          schools: [{ id: 'school-123', schoolName: "St. Andrew's College", slug: schoolSlug }]
        })
      });
    });

    // Mock grades for Classes page
    await page.route('**/api/v1/schools/school-123/grades', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          grades: [
            {
              id: 'grade-12',
              name: 'Grade 12',
              classes: [
                { id: 'class-12a', name: 'Grade 12A', current_learners: 30, capacity: 35, class_teacher_name: 'Dr. Sarah Jenkins' }
              ]
            }
          ]
        })
      });
    });
  });

  test('Teacher Management Page loads and displays data', async ({ page }) => {
    await page.route('**/api/v1/schools/school-123/teachers', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          teachers: [
            { id: 'teacher-1', name: 'Dr. Sarah Jenkins', role: 'Head of Science', department: 'Natural Sciences', student_count: 180, performance: '98%', status: 'Active' }
          ]
        })
      });
    });

    await page.goto(`${baseUrl}/admin/${schoolSlug}/teachers`);
    await expect(page.getByText('Teacher Management')).toBeVisible();
    await expect(page.getByText('Dr. Sarah Jenkins')).toBeVisible();
    await expect(page.getByText('Head of Science')).toBeVisible();

    await page.screenshot({ path: 'verify_teachers_phase3.png' });
  });

  test('Subjects Page loads and displays data', async ({ page }) => {
    await page.route('**/api/v1/schools/school-123/subjects', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          subjects: [
            { id: 'sub-1', name: 'Mathematics', code: 'MATH-SEC', teacher_count: 8, class_count: 12, performance: '82%', trend: '+4%', level: 'Secondary' }
          ]
        })
      });
    });

    await page.goto(`${baseUrl}/admin/${schoolSlug}/subjects`);
    await expect(page.getByText('Subject Curriculum')).toBeVisible();
    await expect(page.getByText('Mathematics')).toBeVisible();
    await expect(page.getByText('MATH-SEC')).toBeVisible();

    await page.screenshot({ path: 'verify_subjects.png' });
  });

  test('Attendance Page loads and displays data', async ({ page }) => {
    await page.route('**/api/v1/schools/school-123/attendance/statistics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            presence_rate: '94.5%',
            unexcused_absences: 12,
            late_arrivals: 5,
            at_risk_count: 3
          }
        })
      });
    });

    await page.route('**/api/v1/schools/school-123/attendance/classes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          classes: [
            { name: 'Grade 12A', teacher_name: 'Dr. Sarah Jenkins', present_count: 28, late_count: 2, absent_count: 0, attendance_percentage: '93%' }
          ]
        })
      });
    });

    await page.goto(`${baseUrl}/admin/${schoolSlug}/attendance`);
    await expect(page.getByText('Attendance Tracking')).toBeVisible();
    await expect(page.getByText('94.5%')).toBeVisible();
    await expect(page.getByText('Grade 12A')).toBeVisible();

    await page.screenshot({ path: 'verify_attendance.png' });
  });

  test('Classes Page loads and displays data', async ({ page }) => {
    await page.goto(`${baseUrl}/admin/${schoolSlug}/classes`);
    await expect(page.getByText('Classroom Management')).toBeVisible();
    await expect(page.getByText('Grade 12A')).toBeVisible();
    await expect(page.getByText('Dr. Sarah Jenkins')).toBeVisible();

    await page.screenshot({ path: 'verify_classes.png' });
  });
});
