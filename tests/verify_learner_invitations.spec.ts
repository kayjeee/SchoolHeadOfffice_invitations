import { test, expect } from '@playwright/test';

test.describe('Learner Directory - Multi-Channel Invitations & Requests', () => {
  const schoolSlug = 'kagiso-high-school';
  const baseUrl = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // 1. Mock School Resolution
    await page.route(`**/api/v1/schools?search=${schoolSlug}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          schools: [{ id: 'school-123', schoolName: "Kagiso High School", slug: schoolSlug }]
        })
      });
    });

    // 2. Mock Grades
    await page.route('**/api/v1/schools/school-123/grades', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          grades: [
            { id: 'grade-10', name: 'Grade 10' },
            { id: 'grade-11', name: 'Grade 11' }
          ]
        })
      });
    });

    // 3. Mock Enrolled Learners
    await page.route('**/api/v1/schools/school-123/learners**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          learners: [
            { id: 'lrn-1', firstName: 'Lethabo', lastName: 'Manana', gradeId: 'grade-10', status: 'active', parent_phone: '+27700400585', admission_number: 'LNR-1001' },
            { id: 'lrn-2', firstName: 'Kagiso', lastName: 'Sello', gradeId: 'grade-11', status: 'active', parent_phone: '+27821234567', admission_number: 'LNR-1002' }
          ],
          total: 2
        })
      });
    });

    // 4. Mock Learner Statistics
    await page.route('**/api/v1/learners/statistics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          total: 2,
          by_status: { 'active': 2 },
          by_gender: {}
        })
      });
    });

    // 5. Mock Invitations CRM
    await page.route('**/api/v1/invitations**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            invitations: [
              {
                id: 'inv-1',
                token: 'tok-1',
                learner_name: 'Lethabo Manana',
                parent_name: 'Mrs Manana',
                parent_phone: '+27700400585',
                parent_email: '700400585@gdeschools.gov.za',
                status: 'pending',
                created_at: new Date().toISOString(),
                grade_name: 'Grade 10',
                channel: 'WhatsApp'
              }
            ],
            total: 1
          })
        });
      } else if (route.request().method() === 'POST') {
        const url = route.request().url();
        if (url.includes('bulk_create')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              invitations: [
                { id: 'inv-101', token: 'tok-bulk-1', parent_phone: '+27700400585', parent_name: 'Mrs Manana' },
                { id: 'inv-102', token: 'tok-bulk-2', parent_phone: '+27821234567', parent_name: 'Mr Sello' }
              ]
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'Dispatched successfully' })
          });
        }
      } else {
        await route.fallback();
      }
    });

    // Mock send-bulk endpoint
    await page.route('**/api/whatsapp-business/send-bulk**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          stats: { total: 2, sent: 2, failed: 0 }
        })
      });
    });

    // 6. Mock Parent Portal Access Requests
    await page.route('**/api/v1/request_accesses/school/school-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'req-1',
            parent_name: 'Mrs Manana',
            parent_email: '700400585@gdeschools.gov.za',
            learner_name: 'Lethabo Manana',
            created_at: new Date().toISOString(),
            status: 'pending'
          }
        ])
      });
    });
  });

  test('Learner Directory and Invitations CRM renders and supports multi-channel dispatch', async ({ page }) => {
    // 1. Navigate to page
    await page.goto(`${baseUrl}/admin/${schoolSlug}/learners`);
    await page.waitForTimeout(1000);

    // Verify stats cards loaded
    await expect(page.getByText('Total Enrolled')).toBeVisible();
    await expect(page.getByText('Active Learners')).toBeVisible();

    // Verify Directory table has mock learners
    await expect(page.getByText('Lethabo Manana').first()).toBeVisible();
    await expect(page.getByText('Kagiso Sello')).toBeVisible();

    // Take screenshot of the directory list
    await page.screenshot({ path: '/home/jules/verification/screenshots/verify_learner_directory_list.png' });

    // 2. Switch to Invitations CRM Tab
    await page.getByRole('button', { name: 'Invitations CRM' }).click();
    await page.waitForTimeout(1000);

    // Verify pending invitations and request accesses are displayed
    await expect(page.getByText('Total Invitations Sent')).toBeVisible();
    await expect(page.getByText('Parent Portal Access Requests & Registrations')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Mrs Manana' }).first()).toBeVisible();

    // Take screenshot of invitations CRM tab
    await page.screenshot({ path: '/home/jules/verification/screenshots/verify_invitations_crm_tab.png' });

    // 3. Open Invitations Wizard Modal
    console.log('Clicking Invite Wizard Button...');
    await page.getByRole('button', { name: 'Launch Invite Wizard' }).first().click();

    // Wait for the modal container and input to be fully ready & interactive
    const input = page.getByPlaceholder('e.g. Lethabo Manana');
    await input.waitFor({ state: 'visible', timeout: 5000 });

    // Take snapshot of modal state
    await page.screenshot({ path: '/home/jules/verification/screenshots/verify_modal_state_after_click.png' });

    // Check if the modal title is visible
    await expect(page.getByText('Parent Portal Invitations')).toBeVisible();

    // Type name to trigger suggestion autocomplete
    await input.fill('Leth');
    await page.waitForTimeout(1000);

    // Check autocomplete dropdown suggestion list
    await expect(page.getByText('Matching enrolled students')).toBeVisible();

    // Select the auto-suggested option
    await page.getByRole('button', { name: 'Lethabo Manana' }).click();
    await page.waitForTimeout(1000);

    // Expect name field fully completed
    const nameVal = await input.inputValue();
    expect(nameVal).toBe('Lethabo Manana');

    // Verify that Email button is disabled
    await expect(page.getByRole('button', { name: 'Email' })).toBeDisabled();

    // Fill Phone Input
    const phoneInput = page.getByPlaceholder('e.g. 0721234567 or +27...');
    await phoneInput.fill('0701234567');
    await page.waitForTimeout(1000);

    // Take screenshot of modal in WhatsApp Invitation mode
    await page.screenshot({ path: '/home/jules/verification/screenshots/verify_invitation_wizard_whatsapp.png' });

    // Dispatch Invite
    await page.getByRole('button', { name: 'Send Invitation' }).click();
    await page.waitForTimeout(1000);

    // Ensure modal successfully closed and success notification was shown
    await expect(page.getByText('Parent Portal Invitations')).not.toBeVisible();
  });

  test('Bulk Invitation Wizard with real learner picker supports scope-based selection and dispatch', async ({ page }) => {
    // 1. Navigate to page
    await page.goto(`${baseUrl}/admin/${schoolSlug}/learners`);
    await page.waitForTimeout(1000);

    // 2. Switch to Invitations CRM Tab
    await page.getByRole('button', { name: 'Invitations CRM' }).click();
    await page.waitForTimeout(1000);

    // 3. Open Invitations Wizard Modal
    await page.getByRole('button', { name: 'Launch Invite Wizard' }).first().click();
    await page.waitForTimeout(1000);

    // 4. Click Bulk Paste Contact List Tab
    await page.getByRole('button', { name: 'Bulk Paste Contact List' }).click();
    await page.waitForTimeout(1000);

    // Verify scope selector is visible
    await expect(page.getByText('Recipient Selection Scope')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Whole School' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Grade' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Class' })).toBeVisible();

    // Verify learners are listed
    await expect(page.getByText('Lethabo Manana').last()).toBeVisible();
    await expect(page.getByText('Kagiso Sello').last()).toBeVisible();

    // Verify "Select All" checkbox is present
    const checkboxes = page.locator('input[type="checkbox"]');
    // Click Select All (first checkbox in table header)
    await checkboxes.first().click();
    await page.waitForTimeout(500); // Wait for state to sync

    // Verify running count
    await expect(page.getByText('Select Recipients (2 Selected)')).toBeVisible();

    // Verify dispatch button text is updated to "Send 2 Invitations"
    const sendButton = page.getByRole('button', { name: 'Send 2 Invitations' });
    await expect(sendButton).toBeVisible();

    // Click Send
    await sendButton.click();
    await page.waitForTimeout(1000);

    // Ensure modal successfully closed
    await expect(page.getByText('Parent Portal Invitations')).not.toBeVisible();
  });
});
