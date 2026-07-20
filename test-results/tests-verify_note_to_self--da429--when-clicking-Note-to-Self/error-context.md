# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify_note_to_self.spec.ts >> Communications Hub - Note to Self >> should open a self-conversation when clicking Note to Self
- Location: tests/verify_note_to_self.spec.ts:97:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('button').filter({ hasText: 'Note to self' }).first()
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: 'Note to self' }).first()
    23 × locator resolved to <button class="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all group bg-primary-accent/10 border-primary-accent/20">…</button>
       - unexpected value "hidden"

```

```yaml
- complementary:
  - heading "Far North Secondary School" [level=1]
  - paragraph: Admin Portal
  - navigation:
    - button "Management Hub"
    - link "Dashboard":
      - /url: /admin/far-north-secondary-school
    - link "Learners":
      - /url: /admin/far-north-secondary-school/learners
    - link "Teachers":
      - /url: /admin/far-north-secondary-school/teachers
    - link "Parents":
      - /url: /admin/far-north-secondary-school/parents
    - link "Communications":
      - /url: /admin/far-north-secondary-school/communications
    - link "Finance":
      - /url: /admin/far-north-secondary-school/finance
    - link "Reports":
      - /url: /admin/far-north-secondary-school/reports
    - link "Settings":
      - /url: /admin/far-north-secondary-school/settings
    - button "Academic Modules"
    - link "Grades":
      - /url: /admin/far-north-secondary-school/grades
    - link "Classes":
      - /url: /admin/far-north-secondary-school/classes
    - link "Subjects":
      - /url: /admin/far-north-secondary-school/subjects
    - link "Attendance":
      - /url: /admin/far-north-secondary-school/attendance
    - link "Assessments":
      - /url: /admin/far-north-secondary-school/assessments
    - link "Timetable":
      - /url: /admin/far-north-secondary-school/timetable
    - link "Analytics":
      - /url: /admin/far-north-secondary-school/analytics
  - text: MM
  - paragraph: Mrs Manana
  - paragraph: 700400585@gdeschools.gov.za
  - button "ADMIN"
  - button "STAFF/TEACHER"
  - button "Sign Out"
- main:
  - navigation:
    - link "Far North Secondary School":
      - /url: /admin/far-north-secondary-school
    - link "Dashboard":
      - /url: /admin/far-north-secondary-school
    - link "Communications":
      - /url: /admin/far-north-secondary-school/communications
  - combobox:
    - option "2024 Academic Year" [selected]
    - option "2023 Academic Year"
  - textbox "Search learners, teachers, or classes..."
  - button
  - text: Mrs Manana System Admin M
  - heading "Communications Hub" [level=2]
  - paragraph: Connect with parents, teachers, and staff in real-time. Enterprise WhatsApp for schools.
  - button "Announcements"
  - button "New Broadcast"
  - heading "Messages" [level=2]
  - button "Saved Messages"
  - button "New Group Message"
  - button "Note to self"
  - button "New Message"
  - textbox "Search conversations..."
  - button "Note to self Private workspace":
    - paragraph: Note to self
    - paragraph: Private workspace
  - heading "Active Conversations" [level=3]
  - button "System Admin 05:14 PM Start a conversation":
    - heading "System Admin" [level=4]
    - text: 05:14 PM
    - paragraph: Start a conversation
  - heading "System Admin" [level=3]
  - paragraph: Offline
  - button
  - button
  - button
  - button
  - button
  - paragraph: No messages yet
  - button "Attach File"
  - button "Add emoji"
  - textbox "Type your message..."
  - button
  - button
  - button "Suggest AI Response" [disabled]
  - heading "98% Open Rate" [level=4]
  - paragraph: WhatsApp messages have a significantly higher engagement than email.
  - heading "Instant Delivery" [level=4]
  - paragraph: Send urgent school alerts and newsletters directly to parents phones.
  - heading "Safe & Secure" [level=4]
  - paragraph: End-to-end encrypted messaging with full school audit logs.
- img
- text: 6 errors
- button "Hide Errors":
  - img
- status:
  - img
  - text: Static route
  - button "Hide static indicator":
    - img
- alert
```

# Test source

```ts
  12  |         status: 200,
  13  |         contentType: 'application/json',
  14  |         body: JSON.stringify({
  15  |           user: { name: 'System Admin', email: 'admin@school.com', sub: 'admin-123' },
  16  |           accessToken: 'dummy-token'
  17  |         })
  18  |       });
  19  |     });
  20  |
  21  |     // Mock school resolution
  22  |     await page.route('**/api/v1/schools?search=far-north-secondary-school', async (route) => {
  23  |       await route.fulfill({
  24  |         status: 200,
  25  |         contentType: 'application/json',
  26  |         body: JSON.stringify({
  27  |           success: true,
  28  |           schools: [
  29  |             { id: 'school-123', name: 'Far North Secondary School', slug: 'far-north-secondary-school' }
  30  |           ]
  31  |         })
  32  |       });
  33  |     });
  34  |
  35  |     // Mock school by slug
  36  |     await page.route('**/api/v1/schools/far-north-secondary-school', async (route) => {
  37  |       await route.fulfill({
  38  |         status: 200,
  39  |         contentType: 'application/json',
  40  |         body: JSON.stringify({ id: 'school-123', name: 'Far North Secondary School', slug: 'far-north-secondary-school' })
  41  |       });
  42  |     });
  43  |
  44  |     // Mock directory
  45  |     await page.route('**/schools/school-123/directory', async (route) => {
  46  |       await route.fulfill({
  47  |         status: 200,
  48  |         contentType: 'application/json',
  49  |         body: JSON.stringify({
  50  |           admins: [{ id: 'admin-123', name: 'System Admin', role: 'admin' }],
  51  |           teachers: [],
  52  |           parents: []
  53  |         })
  54  |       });
  55  |     });
  56  |
  57  |     // Mock conversations with state
  58  |     await page.route('**/api/v1/conversations', async (route) => {
  59  |       if (route.request().method() === 'POST') {
  60  |         const newConv = {
  61  |           id: 'conv-self-123',
  62  |           participant_ids: ['admin-123'],
  63  |           participants: [{ id: 'admin-123', name: 'System Admin' }],
  64  |           updated_at: new Date().toISOString(),
  65  |           unread_count: 0
  66  |         };
  67  |         conversations.push(newConv);
  68  |         await route.fulfill({
  69  |           status: 201,
  70  |           contentType: 'application/json',
  71  |           body: JSON.stringify(newConv)
  72  |         });
  73  |       } else {
  74  |         await route.fulfill({
  75  |           status: 200,
  76  |           contentType: 'application/json',
  77  |           body: JSON.stringify(conversations)
  78  |         });
  79  |       }
  80  |     });
  81  |
  82  |     // Mock messages for the new conversation
  83  |     await page.route('**/api/v1/conversations/conv-self-123/messages', async (route) => {
  84  |       await route.fulfill({
  85  |         status: 200,
  86  |         contentType: 'application/json',
  87  |         body: JSON.stringify([])
  88  |       });
  89  |     });
  90  |
  91  |     // Mock mark as read
  92  |     await page.route('**/api/v1/conversations/conv-self-123/mark_as_read', async (route) => {
  93  |       await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  94  |     });
  95  |   });
  96  |
  97  |   test('should open a self-conversation when clicking Note to Self', async ({ page }) => {
  98  |     await page.setViewportSize({ width: 1280, height: 1000 });
  99  |     await page.goto('http://localhost:3000/admin/far-north-secondary-school/communications');
  100 |
  101 |     // Wait for the UI to be ready
  102 |     const noteToSelfButton = page.getByTitle('Note to self').last();
  103 |     await expect(noteToSelfButton).toBeVisible({ timeout: 15000 });
  104 |
  105 |     await noteToSelfButton.click();
  106 |
  107 |     await page.waitForTimeout(3000);
  108 |     await page.screenshot({ path: 'note_to_self_debug_last.png', fullPage: true });
  109 |
  110 |     // 1. Verify it appears in the sidebar list as "Note to self"
  111 |     const sidebarItem = page.locator('button').filter({ hasText: 'Note to self' }).first();
> 112 |     await expect(sidebarItem).toBeVisible({ timeout: 10000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  113 |
  114 |     // 2. Verify the chat window header shows "Me (Private)"
  115 |     const chatHeader = page.locator('h3').filter({ hasText: 'Me (Private)' });
  116 |     await expect(chatHeader).toBeVisible({ timeout: 10000 });
  117 |
  118 |     // Take a screenshot for confirmation
  119 |     await page.screenshot({ path: 'note_to_self_confirmed_final.png', fullPage: true });
  120 |   });
  121 | });
  122 |
```