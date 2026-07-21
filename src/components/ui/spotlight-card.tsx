import React, { useRef, useState } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  maxRadius?: number;
}

/**
 * SpotlightCard component inspired by Magic UI & Aceternity UI.
 * Creates a modern card component where a glow effect follows the user's cursor.
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(12, 138, 67, 0.15)", // Default NNC brand-green tint
  maxRadius = 350,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden border border-slate-200/80 bg-white rounded-3xl transition-shadow duration-300 hover:shadow-md ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${maxRadius}px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
};
