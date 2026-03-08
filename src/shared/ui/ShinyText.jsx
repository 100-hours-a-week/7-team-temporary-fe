"use client";

import { useRef, useEffect } from "react";

const ShinyText = ({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  delay = 0,
}) => {
  const spanRef = useRef(null);
  const rafRef = useRef(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (disabled) return;

    const animationDuration = speed * 1000;
    const delayDuration = delay * 1000;
    const cycleDuration = animationDuration + delayDuration;

    const animate = (time) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      } else {
        elapsedRef.current += time - lastTimeRef.current;
        lastTimeRef.current = time;
      }

      const cycleTime = elapsedRef.current % cycleDuration;
      const p = cycleTime < animationDuration ? (cycleTime / animationDuration) * 100 : 100;

      if (spanRef.current) {
        spanRef.current.style.backgroundPosition = `${150 - p * 2}% center`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      elapsedRef.current = 0;
    };
  }, [disabled, speed, delay]);

  return (
    <span
      ref={spanRef}
      className={`shiny-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundPosition: "150% center",
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
