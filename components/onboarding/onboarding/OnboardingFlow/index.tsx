import Step1CreateGrades from './Step1CreateGrades';
import Step2UploadLearners from './Step2UploadLearners';
import Step3SendInvites from './Step3SendInvites';
import StepCompletion from './StepCompletion';

// ----------------------
// Steps Configuration
// ----------------------
export const STEPS = [
  { id: "step1", name: "Create Grades", component: Step1CreateGrades },
  { id: "step2", name: "Upload Learners", component: Step2UploadLearners },
  { id: "step3", name: "Send Invites", component: Step3SendInvites },
  { id: "step4", name: "Completion", component: StepCompletion },
];
