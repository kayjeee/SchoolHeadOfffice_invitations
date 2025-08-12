import { FC } from 'react';
import ProfessionalSection from "./Admindropcomponents/ProfessionalSection";
import SchoolDropdown from './Admindropcomponents/SchoolDropdown';

interface User {
  id?: string;
  name?: string;
  email?: string;
  // Add other user properties as needed
}

interface AdminDropProps {
  user?: User;
  userRoles?: string[];
}

const AdminDrop: FC<AdminDropProps> = ({ user = {}, userRoles = [] }) => {
  const { name = "User" } = user;
  const isAdmin = Array.isArray(userRoles) && userRoles.includes("Admin");

  return (
    <div className="relative">
      {isAdmin ? (
        <div className="absolute left-0 mt-2 w-90 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex">
          {/* Left Half */}
          <div className="w-1/2 p-4 space-y-8">
            {/* Greeting Section */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Hello, {name}!
              </h2>
              <p className="text-sm text-gray-500">
                Manage your school and resources below.
              </p>
            </div>

            {/* Search Component */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
              />
            </div>

            {/* Schools Section */}
            <div className="space-y-2">
              <SchoolDropdown user={user} />
            </div>

            {/* Professional Section */}
            <ProfessionalSection user={user} />

            {/* Community Resources Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500">
                Community Resources
              </h3>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Fundraiser</span>
              </div>
            </div>
          </div>

          {/* Right Half */}
          <div className="w-1/2 p-4 space-y-4 border-l border-gray-100">
            {/* Create Section */}
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Create</span>
            </div>

            {/* Create Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Newsletter</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Event</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Life Event</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Resource</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <span className="block px-4 py-2 text-gray-500">
          No admin access available for {name}.
        </span>
      )}
    </div>
  );
};

export default AdminDrop;
