import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { useApp } from '../useApp';

const sendImpression = async (resource, userEmail,resourceschoolname) => {
  try {
    // Step 1: Check if the impression already exists
    const checkResponse = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/checkResourceImpression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ resourceId: resource, userEmail, schoolname:resourceschoolname }),
    });
    console.log(' resource:', resource);
    const checkData = await checkResponse.json();

    if (checkData.exists) {
      console.log('Impression already recorded for resource:', resourceId);
      return; // Impression already exists, no need to create a new one
    }

    // Step 2: Save the new impression if it does not already exist
    const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/resourceImpression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resource, userEmail,
        schoolname:resourceschoolname
       }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('Impression sent for resource:', resourceId);
    } else {
      console.error('Failed to send impression:', data.error);
    }
  } catch (error) {
    console.error('Error sending impression:', error);
  }
};


const ResourceTab = ({ school, folders, selectedSchool, refreshFolders, refreshResources, resources }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState('folders');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editedFolder, setEditedFolder] = useState(null);
  const [viewedResources, setViewedResources] = useState(new Set());
  const modalRef = useRef(null);
  const resourceRefs = useRef(new Map());
  const app = useApp();

  useEffect(() => {
    // Load viewed resources from localStorage
    const viewedResourcesFromStorage = JSON.parse(localStorage.getItem('viewedResources')) || [];
    setViewedResources(new Set(viewedResourcesFromStorage));
  }, []);

  useEffect(() => {
    // Save viewed resources to localStorage whenever it changes
    localStorage.setItem('viewedResources', JSON.stringify([...viewedResources]));
  }, [viewedResources]);

  const handleResourceVisibility = async (resource) => {
    if (resource && !viewedResources.has(resource._id)) {
      const userEmail = app.currentUser.profile.email;
      console.log('resourceid:', resource._id);
      await sendImpression(resource._id, userEmail,resource.schoolname);
      setViewedResources(prev => new Set(prev).add(resource.id));
    }
  };

  const handleResourceClick = (resource) => {
    window.open(resource.link, '_blank');
    handleResourceVisibility(resource);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCreateModalOpen(false);
      }
    };

    if (isCreateModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateModalOpen]);

  const closeEditModal = () => {
    setSelectedResource(null);
    setIsEditModalOpen(false);
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setActiveTab('folders');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex-grow overflow-y-auto">
      {loading && <LoadingSpinner />}
      <div className="flex justify-between mb-4">
        <button
          className={`px-4 py-2 focus:outline-none ${activeTab === 'folders' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          onClick={() => handleTabClick('folders')}
        >
          Folders
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${activeTab === 'allResources' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          onClick={() => handleTabClick('allResources')}
        >
          All Resources
        </button>
      </div>

      <div className="flex">
        <div className="w-1/2 pr-2">
          {activeTab === 'folders' && (
            <div>
              {folders.length === 0 ? (
                <div className="text-center text-gray-500 mt-4">No folders available yet</div>
              ) : (
                folders.map((folder) => (
                  <div
                    key={folder._id.toString()}
                    className={`flex items-left justify-between border-b py-2 cursor-pointer ${
                      selectedFolder && selectedFolder._id === folder._id ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => handleFolderClick(folder)}
                  >
                    {school && school.logo && (
                      <img
                        src={school.logo}
                        alt="School Logo"
                        className="w-10 h-10 rounded-full mr-2"
                      />
                    )}
                    <div className="flex items-center justify-between border-b py-2 cursor-pointer">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M15.643 2.084A3 3 0 0117.928 4H2.072A2.99 2.99 0 014 1h10.1c.833 0 1.582.343 2.143.895l1.4 1.189zM4 3c-.55 0-1 .45-1 1v11a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H8.883a2 2 0 00-1.333-.5H4V3zm3 7h7v1H7v-1zm0 2h7v1H7v-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-lg font-semibold">{folder.name}</p>
                          <p className="text-gray-500 text-sm">{folder.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Add any folder-specific buttons or actions here */}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="w-1/2 pl-2">
          {activeTab === 'folders' && selectedFolder && (
            <div>
              {Array.isArray(resources) && resources.length === 0 && (
                <div className="text-center text-gray-500 mt-4">No resources available in this folder</div>
              )}
              {Array.isArray(resources) && resources.map((resource) => {
                if (resource.folderName === selectedFolder.name) {
                  return (
                    <div
                      key={resource.id}
                      className="resource-item border border-gray-300 rounded p-4 my-2"
                      data-id={resource.id}
                      ref={el => {
                        if (el) {
                          resourceRefs.current.set(resource.id, el);
                          console.log('Element ref set:', el);
                        }
                      }}
                      onLoad={() => handleResourceVisibility(resource)} // Trigger visibility check on load
                    >
                      <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                      <p className="text-gray-600">{resource.resourcename}</p>
                      <button
                        type="button"
                        onClick={() => handleResourceClick(resource)}
                        className="text-blue-500 underline cursor-pointer mt-2"
                      >
                        Download
                      </button>
                      {school && school.logo && (
                        <img src={school.logo} alt="School Logo" className="w-10 h-10 rounded-full mt-2" />
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceTab;
