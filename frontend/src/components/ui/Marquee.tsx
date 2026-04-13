import { type ReactNode, useRef, useEffect, useState } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export default function Marquee({ children, speed = 40, className = '' }: MarqueeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, [children]);

  const duration = contentWidth ? contentWidth / speed : 10;

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite`,
          width: 'max-content',
        }}
      >
        <div ref={contentRef} className="flex shrink-0">
          {children}
        </div>
        <div className="flex shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
