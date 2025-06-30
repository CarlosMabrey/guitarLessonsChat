'use client';

import { motion } from 'framer-motion';
import SettingsPanel from '@/components/ui/SettingsPanel';

/**
 * Modal component for displaying settings
 */
const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      key="settings-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, duration: 0.22 }}
        className="bg-[#232a3a] rounded-2xl shadow-2xl p-6 w-full max-w-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close settings"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-100 mb-8">Settings</h2>
        <SettingsPanel />
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;
