import { test, expect } from '@playwright/test';

test.describe('Communications Hub - Note to Self', () => {
  let conversations = [];

  test.beforeEach(async ({ page }) => {
    conversations = [];

    // Mock Auth/API Session
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

    // Mock school resolution
    await page.route('**/api/v1/schools?search=far-north-secondary-school', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          schools: [
            { id: 'school-123', name: 'Far North Secondary School', slug: 'far-north-secondary-school' }
          ]
        })
      });
    });

    // Mock school by slug
    await page.route('**/api/v1/schools/far-north-secondary-school', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'school-123', name: 'Far North Secondary School', slug: 'far-north-secondary-school' })
      });
    });

    // Mock directory
    await page.route('**/schools/school-123/directory', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          admins: [{ id: 'admin-123', name: 'System Admin', role: 'admin' }],
          teachers: [],
          parents: []
        })
      });
    });

    // Mock conversations with state
    await page.route('**/api/v1/conversations', async (route) => {
      if (route.request().method() === 'POST') {
        const newConv = {
          id: 'conv-self-123',
          participant_ids: ['admin-123'],
          participants: [{ id: 'admin-123', name: 'System Admin' }],
          updated_at: new Date().toISOString(),
          unread_count: 0
        };
        conversations.push(newConv);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newConv)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(conversations)
        });
      }
    });

    // Mock messages for the new conversation
    await page.route('**/api/v1/conversations/conv-self-123/messages', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock mark as read
    await page.route('**/api/v1/conversations/conv-self-123/mark_as_read', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
  });

  test('should open a self-conversation when clicking Note to Self', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto('http://localhost:3000/admin/far-north-secondary-school/communications');

    // Wait for the UI to be ready
    const noteToSelfButton = page.getByTitle('Note to self').last();
    await expect(noteToSelfButton).toBeVisible({ timeout: 15000 });

    await noteToSelfButton.click();

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'note_to_self_debug_last.png', fullPage: true });

    // 1. Verify it appears in the sidebar list as "Note to self"
    const sidebarItem = page.locator('button').filter({ hasText: 'Note to self' }).first();
    await expect(sidebarItem).toBeVisible({ timeout: 10000 });

    // 2. Verify the chat window header shows "Me (Private)"
    const chatHeader = page.locator('h3').filter({ hasText: 'Me (Private)' });
    await expect(chatHeader).toBeVisible({ timeout: 10000 });

    // Take a screenshot for confirmation
    await page.screenshot({ path: 'note_to_self_confirmed_final.png', fullPage: true });
  });
});
