Step 1: Create schoolService.js
Let's start by moving all the API call logic. This is a crucial step as it separates your business logic from the UI.

Create a new file at components/schoolpage/CreateSchoolForm/services/schoolService.js.

Copy the getAccessToken function from CreateSchoolForm.js into this new file.

Create new functions for the other API interactions: createSchool, uploadFileToCloudinary, assignAuth0Role, syncBackendRole, and addSchoolToUser. Each function should be an async function and should handle its own fetch request and error handling. This keeps the logic organized.

Export all of these functions.

components/schoolpage/CreateSchoolForm/services/schoolService.js