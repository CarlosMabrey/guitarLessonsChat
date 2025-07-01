import React from 'react';

export default function Overlay({ isOpen, onClick }) {
  return isOpen ? (
    <div
      className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
      onClick={onClick}
      aria-hidden="true"
    />
  ) : null;
}
