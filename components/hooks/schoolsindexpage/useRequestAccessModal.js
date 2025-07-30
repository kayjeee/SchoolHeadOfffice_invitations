// useRequestAccessModal.js (in hooks directory)
import { useState } from 'react';

export const useRequestAccessModal = () => {
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const openRequestAccessModal = () => setShowRequestAccessModal(true);
  const closeRequestAccessModal = () => setShowRequestAccessModal(false);

  const openPendingModal = () => setShowPendingModal(true);
  const closePendingModal = () => setShowPendingModal(false);

  return {
    showRequestAccessModal,
    showPendingModal,
    openRequestAccessModal,
    closeRequestAccessModal,
    openPendingModal,
    closePendingModal,
  };
};
