import { z } from 'zod';
import { apiClient } from './api-client';

export const UsersAPI = {
  /**
   * Send a heartbeat to the backend to track user presence.
   */
  async heartbeat(auth0Id: string): Promise<any> {
    return apiClient.post(`/users/${auth0Id}/heartbeat`, {}, z.any());
  }
};
