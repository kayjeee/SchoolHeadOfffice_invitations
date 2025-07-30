//componenets/hooks/schoolsindexpage/useFetchSchoolData.js
import { useState, useEffect } from 'react';

export const useFetchSchoolData = (app, selectedSchool) => {
  const [folders, setFolders] = useState([]);
  const [resources, setResources] = useState([]);

  const refreshFolders = async () => {
    if (!app?.currentUser) {
      console.error('No user is logged in');
      return;
    }
    try {
      const response = await app.currentUser.functions.getfolderbasedonselectedschool(selectedSchool);
      if (response && response.result) {
        setFolders(response.result);
      } else {
        console.error('Error refreshing folders: Invalid response format');
      }
    } catch (error) {
      console.error('Error refreshing folders:', error);
    }
  };

  const refreshResources = async () => {
    if (!app?.currentUser) {
      console.error('No user is logged in');
      return;
    }
    try {
      const response = await app.currentUser.functions.getallresourcesbasedonselectedschool(selectedSchool);
      if (response && response.result) {
        setResources(response.result);
      } else {
        console.error('Error refreshing resources: Invalid response format');
      }
    } catch (error) {
      console.error('Error refreshing resources:', error);
    }
  };

  useEffect(() => {
    if (app?.currentUser) {
      refreshFolders();
      refreshResources();
    }
  }, [selectedSchool, app]);

  return { folders, resources, refreshFolders, refreshResources };
};
