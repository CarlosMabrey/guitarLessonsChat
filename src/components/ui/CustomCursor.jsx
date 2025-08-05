'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export default function CustomCursor() {
  const { settings } = useSettings();
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });
  const size = isHovering ? 40 : 20;

  useEffect(() => {
    // Don't show custom cursor on mobile devices
    if (window.innerWidth <= 768) {
      return;
    }

    setIsVisible(true);
    
    const moveCursor = (e) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
    };

    // Add hover state for interactive elements
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add event listeners for all interactive elements
    const interactiveElements = [
      ...document.querySelectorAll('a, button, input, textarea, [role="button"], [tabindex="0"]')
    ];

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [cursorX, cursorY, size]);

  if (!isVisible || settings.customCursor === false) return null;

  return (
    <motion.div 
      className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-difference"
      style={{
        width: size,
        height: size,
        x: cursorX,
        y: cursorY,
        backgroundColor: '#818cf8',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        opacity: isHovering ? 0.8 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
    />
  );
}
