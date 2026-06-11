/**
 * Section wrapper for page content — Tailwind only.
 */

import { ReactNode, CSSProperties } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Section({ children, className = "", style }: SectionProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`} style={style}>
      {children}
    </div>
  );
}
