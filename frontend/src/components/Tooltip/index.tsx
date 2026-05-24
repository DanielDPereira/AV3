import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  label: string;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({ label, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = label.length * 7 + 24;
      let x = rect.left + rect.width / 2;
      // Clamp horizontally
      x = Math.max(tooltipWidth / 2 + 8, Math.min(x, window.innerWidth - tooltipWidth / 2 - 8));
      setCoords({ x, y: rect.top - 8 });
      setVisible(true);
    }, 300);
  }, [label]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </span>
      {visible && createPortal(
        <div
          role="tooltip"
          className="fixed z-[9999] pointer-events-none animate-tooltip-in"
          style={{ left: coords.x, top: coords.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-inverse-surface text-inverse-on-surface px-sm py-xs rounded font-label-sm text-label-sm whitespace-nowrap shadow-lg">
            {label}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
