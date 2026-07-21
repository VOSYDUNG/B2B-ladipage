import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number; // in seconds
  duration?: number; // in seconds
  decimalPlaces?: number;
  className?: string;
}

/**
 * NumberTicker component inspired by Magic UI.
 * Animates a numeric count-up/count-down transition when entering the viewport.
 */
export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = "up",
  delay = 0,
  duration = 2,
  decimalPlaces = 0,
  className = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  
  // Configure spring animation for smooth, premium physics
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest));
      }
    });
  }, [springValue, decimalPlaces]);

  return (
    <span
      ref={ref}
      className={`inline-block tabular-nums tracking-tighter ${className}`}
    >
      0
    </span>
  );
};
