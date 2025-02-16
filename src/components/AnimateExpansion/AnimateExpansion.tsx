import { cn } from "@/lib/classNames";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

export function AnimateExpansion({
  children,
  className,
  overrideHeight,
  inheritDuration,
}: PropsWithChildren<{
  className?: string;
  overrideHeight?: number;
  inheritDuration?: boolean;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const elem = entries[0]!;
      setHeight(elem.contentRect.height);
    });

    observer.observe(containerRef.current!);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={cn(
        "transition-height",
        inheritDuration ? "duration-inherit" : "duration-200"
      )}
      style={{ height: `${overrideHeight ?? height}px` }}
    >
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </div>
  );
}
