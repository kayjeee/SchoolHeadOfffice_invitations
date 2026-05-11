import { z } from 'zod';
import { apiClient } from './api-client';

export const UsersAPI = {
  /**
   * Send a heartbeat to the backend to track user presence.
   */
  async heartbeat(): Promise<{ success: boolean }> {
    return apiClient.post('/users/heartbeat', {}, z.object({
      success: z.boolean()
    }));
  }
};
