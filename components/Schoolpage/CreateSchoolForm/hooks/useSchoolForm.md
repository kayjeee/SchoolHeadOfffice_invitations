Step 3: Create useSchoolForm.js
This custom hook will replace most of the logic currently inside CreateSchoolForm.js. It will handle all useState declarations, the step navigation, and the main handleFormSubmission function, which will now use the service and utility files we just created.

Create the file at components/schoolpage/CreateSchoolForm/hooks/useSchoolForm.js.

Move all the state declarations (useState) from the original CreateSchoolForm component into this new hook.

Import the functions from schoolService.js and validators.js.

Move the navigation logic (handleNextStep, handlePreviousStep) and the main submission handler (handleAuthenticationAndFormSubmission) into the hook.

Update the submission handler to call the functions from schoolService.js instead of having the fetch calls directly inside the component.

The hook should return an object containing all the state variables and handler functions that the index.js container will need.

components/schoolpage/CreateSchoolForm/hooks/useSchoolForm.js