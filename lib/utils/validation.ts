// lib/utils/validation.ts
import { z } from 'zod';

export const profileSchema = z.object({
  first_name: z.string().min(2, 'First name is too short'),
  last_name: z.string().min(2, 'Last name is too short'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
});

export const linkLearnerSchema = z.object({
  learnerId: z.string().min(6, 'Invalid Learner ID'),
});
