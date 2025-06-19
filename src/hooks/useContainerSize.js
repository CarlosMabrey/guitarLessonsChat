import { useState, useEffect, useRef } from 'react';

export function useContainerSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setSize({ width, height });
      }
    };

    // Initial measurement
    updateSize();

    // Update on window resize with debounce
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 100);
    };

    // Use ResizeObserver if available
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  return [containerRef, size];
}
