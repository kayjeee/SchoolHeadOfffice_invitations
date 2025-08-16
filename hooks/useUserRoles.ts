import { useState, useEffect } from 'react';
import { UserRole } from '../components/Layouts/shared/types/UserRole';

export const useUserRoles = (userId?: string) => {
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Example: fetch roles from your API
    const fetchRoles = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/roles`);
        const data: UserRole[] = await res.json();
        setRoles(data);
      } catch (error) {
        console.error('Failed to fetch user roles:', error);
      }
    };

    fetchRoles();
  }, [userId]);

  return roles;
};

// Ensures this file is treated as a module even if nothing else is exported
export {};
