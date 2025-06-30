'use client';

/**
 * Overlay component for mobile when sidebar is open
 */
const Overlay = ({ isOpen, onClick }) => {
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

export default Overlay;
