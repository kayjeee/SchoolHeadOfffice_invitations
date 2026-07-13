import { test, expect } from '@playwright/test';
import { ParentService } from '../lib/services/parent.service';
import { apiClient } from '../lib/api/api-client';

test.describe('Parent Role Synchronization Service', () => {
  test('ParentService.syncParentRole handles existing user without parent role', async () => {
    // Save original methods
    const originalGet = apiClient.get;
    const originalPatch = apiClient.patch;

    const mockUser = {
      auth0_id: 'auth0|mock-user-123',
      name: 'Mock Parent',
      email: 'mockparent@example.com',
      roles: ['teacher', 'default_role']
    };

    let patchCalled = false;
    let patchedRoles: string[] = [];

    // Mock apiClient
    apiClient.get = async (endpoint: string) => {
      if (endpoint.includes('auth0%7Cmock-user-123')) {
        return mockUser;
      }
      return originalGet.call(apiClient, endpoint, null as any);
    };

    apiClient.patch = async (endpoint: string, body: any) => {
      if (endpoint.includes('auth0%7Cmock-user-123/update_roles')) {
        patchCalled = true;
        patchedRoles = body.roles;
        return { success: true };
      }
      return originalPatch.call(apiClient, endpoint, body, null as any);
    };

    // Temporarily stub Auth0 token and role assignment
    const originalGetToken = ParentService.getAuth0ManagementToken;
    const originalAssignRole = ParentService.assignAuth0ParentRole;
    ParentService.getAuth0ManagementToken = async () => 'mock-token';
    ParentService.assignAuth0ParentRole = async () => {};

    try {
      await ParentService.syncParentRole('auth0|mock-user-123', 'mockparent@example.com', 'Mock Parent');

      // Assertions
      expect(patchCalled).toBe(true);
      expect(patchedRoles).toContain('parent');
      expect(patchedRoles).toContain('teacher');
      expect(patchedRoles).not.toContain('default_role');
    } finally {
      // Restore original methods
      apiClient.get = originalGet;
      apiClient.patch = originalPatch;
      ParentService.getAuth0ManagementToken = originalGetToken;
      ParentService.assignAuth0ParentRole = originalAssignRole;
    }
  });

  test('ParentService.syncParentRole skips when user already has parent role', async () => {
    const originalGet = apiClient.get;
    const originalPatch = apiClient.patch;

    const mockUser = {
      auth0_id: 'auth0|mock-user-456',
      name: 'Mock Parent 2',
      email: 'mockparent2@example.com',
      roles: ['parent', 'teacher']
    };

    let patchCalled = false;

    apiClient.get = async (endpoint: string) => {
      if (endpoint.includes('auth0%7Cmock-user-456')) {
        return mockUser;
      }
      return originalGet.call(apiClient, endpoint, null as any);
    };

    apiClient.patch = async (endpoint: string, body: any) => {
      patchCalled = true;
      return { success: true };
    };

    const originalGetToken = ParentService.getAuth0ManagementToken;
    const originalAssignRole = ParentService.assignAuth0ParentRole;
    ParentService.getAuth0ManagementToken = async () => 'mock-token';
    ParentService.assignAuth0ParentRole = async () => {};

    try {
      await ParentService.syncParentRole('auth0|mock-user-456', 'mockparent2@example.com', 'Mock Parent 2');

      // Assertions
      expect(patchCalled).toBe(false);
    } finally {
      apiClient.get = originalGet;
      apiClient.patch = originalPatch;
      ParentService.getAuth0ManagementToken = originalGetToken;
      ParentService.assignAuth0ParentRole = originalAssignRole;
    }
  });
});
