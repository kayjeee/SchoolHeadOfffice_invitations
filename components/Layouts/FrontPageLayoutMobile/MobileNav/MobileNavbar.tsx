import { useState } from 'react';
import Link from 'next/link';
import MobileSearchBar from './MobileSearchBar';
import MobileMenuDropdown from './MobileMenuDropdown';
import MobileMenuReflectionTabs from './MobileMenuReflectionTabs';
import { useAppTheme } from '../../../../context/ThemeContext';

interface School {
  id: string;
  name: string;       // Changed from schoolName to match FrontPageLayout
  schoolName?: string; // Optional for backward compatibility
  logo?: string;
  schoolImage?: string;
}

interface UserRole {
  id: string;
  name: string;
}

interface MobileNavbarProps {
  schools?: School[];
  userRoles?: UserRole[];
  schoolImage?: string;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ 
  schools = [], 
  userRoles = [], 
  schoolImage 
}) => {
  // ... rest of the component remains the same ...
  // Just update any schoolName references to use name instead
  // Or use school?.schoolName || school?.name for compatibility
};

export default MobileNavbar;
