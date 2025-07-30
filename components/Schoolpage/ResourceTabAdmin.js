import React, { useState, useEffect, useRef } from 'react';
import EditResourceModal from '../EditResourceModal';
import CreateResourceModal from '../CreateResourceModal';
import CreateButton from '../CreateButton';
import CreateFolder from '../CreateFolder';
import CreateResourceInFolderModal from '../CreateResourceInFolderModal';
import LoadingSpinner from '../LoadingSpinner';
import DeleteResourceModal from '../DeleteResourceModal';
import EditFolderModal from '../EditFolderModal';
import DeleteFolderModal from '../DeleteFolderModal';
const ResourceTab = ({school, schoolName, folders, resources, selectedSchool, setResources, closeModal, refreshFolders, refreshResources }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [activeTab, setActiveTab] = useState('folders');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [editedFolder, setEditedFolder] = useState(null);
// Add a new state to manage whether the delete folder modal is open
const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);

  const modalRef = useRef(null);
  const handleFolderDelete = async () => {
    try {
      setLoading(true);
      console.log('Deleting folder with ID:', selectedFolder.id);
      // Implement the logic to delete the folder using an appropriate API call
      // For example:
      // await deleteFolder(selectedFolder.id);
      // After deletion, refresh the list of folders
      await refreshFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
    } finally {
      setLoading(false);
      // Close the delete folder modal after deletion
      closeDeleteFolderModal();
    }
  };
  // Define function to open the delete folder modal
const openDeleteFolderModal = (folder) => {
  setSelectedFolder(folder); // Set the selected folder to be deleted
  setIsDeleteFolderModalOpen(true);
};

// Define function to close the delete folder modal
const closeDeleteFolderModal = () => {
  setSelectedFolder(null); // Reset the selected folder
  setIsDeleteFolderModalOpen(false);
};
  const openEditFolderModal = (folder) => {
    setEditedFolder(folder);
    setIsEditFolderModalOpen(true);
  };

  const closeEditFolderModal = () => {
    setIsEditFolderModalOpen(false);
    setEditedFolder(null);
  };

  const handleEditFolder = (formData) => {
    console.log('Editing folder with data:', formData);
    closeEditFolderModal();
    refreshFolders();
  };

  const handleResourceDelete = async () => {
    try {
      setLoading(true);
      console.log('Deleting resource with ID:', selectedResource.id);
      refreshResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCreateFolderModalOpen(false);
      }
    };

    if (isCreateFolderModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateFolderModalOpen]);

  const openCreateFolderModal = () => {
    setIsCreateFolderModalOpen(true);
  };

  const closeCreateFolderModal = () => {
    setIsCreateFolderModalOpen(false);
  };

  const openCreateResourceInFolderModal = (folder) => {
    setSelectedFolder(folder);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedResource(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (resource) => {
    setSelectedResource(resource);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedResource(null);
    setIsDeleteModalOpen(false);
  };

  const handleResourceEdit = (formData) => {
    console.log('Editing resource with data:', formData);
    closeEditModal();
    refreshResources();
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setActiveTab('folders');
  };

  const addResourceToFolder = (newResource) => {
    setResources((prevResources) => [...prevResources, newResource]);
  };

  const handleTabClick = (tab) => {
    if (tab === 'folders') {
      refreshFolders();
    }
    setActiveTab(tab);
  };

 
  
  const handleFolderCreate = async () => {
    setIsCreateFolderModalOpen(false);
    try {
      setLoading(true);
      await refreshFolders();
    } catch (error) {
      console.error('Error refreshing folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceCreate = async () => {
    setIsCreateModalOpen(false);
    try {
      setLoading(true);
      await refreshResources();
    } catch (error) {
      console.error('Error refreshing resources:', error);
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  return (
    <div className="flex-grow overflow-y-auto">
      {loading && <LoadingSpinner />}
      <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 ml-2 cursor-pointer"
        onClick={openCreateFolderModal} // Attach the onClick event handler to the SVG element
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>

    </div>
    
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
            {folders.map((folder) => (
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  onClick={() => openEditFolderModal(folder)}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 cursor-pointer text-gray-500 hover:text-red-500 transition-colors duration-300"
                  onClick={() => openDeleteFolderModal(folder)}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
            </div>
            
              </div>
            ))}
            
            
              
            </div>
          )}
        </div>

        <div className="w-1/2 pl-2">
          {activeTab === 'folders' && selectedFolder && (
            <div>
              <CreateButton onClick={openCreateModal} buttonText="Create Resource" />
              {Array.isArray(resources) && resources.map((resource) => {
                if (resource.folderName === selectedFolder.name) {
                  return (
                    <div key={resource.id} className="border border-gray-300 rounded p-4 my-2">
                      <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                      <p className="text-gray-600">{resource.resourcename}</p>
                      <button
                        type="button"
                        onClick={() => window.open(resource.link, '_blank')}
                        className="text-blue-500 underline cursor-pointer mt-2"
                      >
                        Download
                      </button>
                      {school && school.logo && (
                        <img src={school.logo} alt="School Logo" className="w-10 h-10 rounded-full mt-2" />
                      )}
                      <div className="flex justify-between items-center mt-2">
                       
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 ml-2 cursor-pointer"
                        onClick={() => openEditModal(resource)}  // Attach the onClick event handler to the SVG element
                      >
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
 
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 ml-2 cursor-pointer"
                        onClick={() => openDeleteModal(resource)}  // Attach the onClick event handler to the SVG element
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>

      {activeTab === 'allResources' && (
        <div>
          <div className="flex justify-between items-center">
            <h2 className="py-3 text-2xl font-bold">Resources View</h2>
            <div>
            <span>add  resource</span>
              <CreateButton onClick={openCreateResourceInFolderModal } />
            </div>
          </div>
          <p>Selected School: {selectedSchool}</p>
          {Array.isArray(resources) && resources.map((resource) => (
            <div key={resource.id} className="border border-gray-300 rounded p-4 my-2">
              <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
              <p className="text-gray-600">{resource.resourcename}</p>
              <button
                type="button"
                onClick={() => window.open(resource.link, '_blank')}
                className="text-blue-500 underline cursor-pointer mt-2"
              >
                Download
              </button>
              {school && school.logo && (
                <img src={school.logo} alt="School Logo" className="w-10 h-10 rounded-full mt-2" />
              )}
              <div className="flex justify-end">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 ml-2 cursor-pointer"
                onClick={() => openEditModal(resource)} // Attach the onClick event handler to the SVG element
              >
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>

              </div>
            </div>
          ))}
          {Array.isArray(resources) && resources.length === 0 && (
            <p className="text-gray-600">No resources available for the selected school.</p>
          )}
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Total Resources: {resources.length}</h3>
          </div>
        </div>
      )}
      

      {/* MODals */}
      {/* // Implement the UI for the delete folder modal */}
      {isDeleteFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div ref={modalRef} className="bg-white p-6 rounded-lg">
            <DeleteFolderModal
              folder={selectedFolder}
              onClose={closeDeleteFolderModal}
              onDelete={handleFolderDelete}
            />
          </div>
        </div>
      )}
      
      {isEditFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div ref={modalRef} className="bg-white p-6 rounded-lg">
            <EditFolderModal
              folder={editedFolder}
              onClose={closeEditFolderModal}
              onEdit={handleEditFolder}
            />
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div ref={modalRef} className="bg-white p-6 rounded-lg">
            <DeleteResourceModal
              resource={selectedResource}
              onClose={closeDeleteModal}
              onDelete={handleResourceDelete}
            />
          </div>
        </div>
      )}
      {isEditModalOpen && <EditResourceModal resource={selectedResource} onClose={closeEditModal} onEdit={handleResourceEdit} />}
      {isCreateModalOpen && (
        <CreateResourceInFolderModal
          onClose={closeCreateModal}
          onCreate={handleResourceCreate}
          folderName={selectedFolder.name}
          selectedSchool={selectedSchool}
          addResourceToFolder={addResourceToFolder}
        />
      )}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div ref={modalRef} className="bg-white p-6 rounded-lg">
            <CreateFolder
              schoolName={schoolName}
              closeModal={closeModal}
              selectedSchool={selectedSchool}
              onFolderCreate={handleFolderCreate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTab;
