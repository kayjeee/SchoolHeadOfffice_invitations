import { useState } from "react";
import Link from "next/link";

const AdminDropdown = ({ userRoles = [] }) => {
  const isAdmin = Array.isArray(userRoles) && userRoles.includes("Admin");

  return (
    <div className="relative">
      {/* Always show the dropdown menu immediately when the component is called */}
      {isAdmin && (
        <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex">
          {/* Left Half */}
          <div className="w-1/2 p-4 space-y-4">
            {/* Search Component */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
              />
             { /* <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" /> */}
            </div>

            {/* Schools Section */}
<div className="space-y-2">
<h3 className="flex items-center text-sm font-semibold text-gray-500">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
    />
  </svg>
  Schools
</h3>
<div className="flex items-center space-x-2">
 
  <span className="text-gray-700">Schools</span>
</div>
</div>


            {/* Professional Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Professional</h3>
              <div className="flex items-center space-x-2">
                {/* Replace with actual event SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Events</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual groups SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Groups</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual newsletter SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Newsletter</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual calendar SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Calendar</span>
              </div>
              {/* Add Admin Dashboard */}
              <div className="flex items-center space-x-2">
                {/* Replace with admin dashboard SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <Link href="/admin/dashboard" passHref>
                  <span className="text-gray-700 hover:bg-gray-100 cursor-pointer">
                    Admin Dashboard
                  </span>
                </Link>
              </div>
            </div>

            {/* Community Resources Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Community Resources</h3>
              <div className="flex items-center space-x-2">
                {/* Replace with actual fundraiser SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Fundraiser</span>
              </div>
            </div>
          </div>

          {/* Right Half */}
          <div className="w-1/2 p-4 space-y-4 border-l border-gray-100">
            {/* Create Section */}
            <div className="flex items-center space-x-2">
              {/* Replace with create SVG */}
              <svg className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Create</span>
            </div>

            {/* Create Options with SVG */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {/* Replace with actual create newsletter SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Newsletter</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual create event SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Event</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual create life event SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Life Event</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual create resource SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Resource</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual create message SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Message</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Replace with actual create report SVG */}
                <svg className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Report</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If not an admin, show a message */}
      {!isAdmin && (
        <span className="block px-4 py-2 text-gray-500">No admin access</span>
      )}
    </div>
  );
};

export default AdminDropdown;
