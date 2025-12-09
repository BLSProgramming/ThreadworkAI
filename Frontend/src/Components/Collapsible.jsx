import { useState, useRef, useEffect } from 'react';

function Collapsible({ title, titleClassName, children, defaultOpen = false, chevronClassName = "text-gray-500", showCollapseButton = false, collapseButtonClassName = "" }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? 'auto' : '0px');

  useEffect(() => {
    if (isOpen) {
      // Ensure we start from 0, then animate to actual height
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        // First set to 0 explicitly
        setHeight('0px');
        // Then animate to full height on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHeight(`${contentHeight}px`);
          });
        });
        // After animation completes, set to auto to handle dynamic content
        const timeout = setTimeout(() => {
          if (isOpen) setHeight('auto');
        }, 320); // Slightly longer than transition duration
        return () => clearTimeout(timeout);
      }
    } else {
      // First set explicit height from auto/current, then animate to 0
      if (contentRef.current) {
        const currentHeight = contentRef.current.scrollHeight;
        setHeight(`${currentHeight}px`);
        // Force reflow before animating to 0
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHeight('0px');
          });
        });
      }
    }
  }, [isOpen]);

  // Sync with defaultOpen prop changes
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const handleCollapseClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between cursor-pointer select-none ${titleClassName}`}
      >
        {title}
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${chevronClassName}`}>
          ▾
        </span>
      </button>
      <div
        ref={contentRef}
        style={{ height, overflow: 'hidden' }}
        className="transition-all duration-300 ease-out relative"
      >
        {children}
        {showCollapseButton && isOpen && (
          <button
            type="button"
            onClick={handleCollapseClick}
            className={`absolute bottom-2 right-2 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md z-10 ${collapseButtonClassName}`}
          >
            Collapse ▲
          </button>
        )}
      </div>
    </div>
  );
}

export default Collapsible;
