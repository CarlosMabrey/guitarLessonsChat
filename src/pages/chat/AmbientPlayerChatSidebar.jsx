import React from 'react';
import AmbientPlayer from '@/components/ui/AmbientPlayer';

export default function AmbientPlayerChatSidebar({ isCollapsed }) {
  // Only show when not collapsed
  if (isCollapsed) return null;
  return (
    <div className="py-2 border-t border-[#232a3a]">
      <AmbientPlayer collapsed={isCollapsed} />
    </div>
  );
}
