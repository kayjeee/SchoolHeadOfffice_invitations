// hooks/useTabHandler.js
import { useState } from 'react';

export const useTabHandler = (isLoggedIn, checkAccessStatus, openModal) => {
  const [selectedTab, setSelectedTab] = useState('details');
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleTabClick = async (tab) => {
    if (!isLoggedIn) {
      openModal();
    } else {
      await checkAccessStatus();
      if (accessStatus === 'Accepted') {
        setSelectedTab(tab);
      } else if (accessStatus === 'Pending') {
        setShowPendingModal(true);
      } else {
        setShowRequestAccessModal(true);
      }
    }
  };

  const closeRequestAccessModal = () => setShowRequestAccessModal(false);
  const closePendingModal = () => setShowPendingModal(false);

  return {
    selectedTab,
    handleTabClick,
    showRequestAccessModal,
    showPendingModal,
    closeRequestAccessModal,
    closePendingModal,
  };
};
