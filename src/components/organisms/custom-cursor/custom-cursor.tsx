"use client";

import React, { useEffect, useState, type FC } from "react";
import { useCursorPosition } from "@/hooks/use-cursor-position";
import styles from "./custom-cursor.module.css";

interface CustomCursorProps {
  isHovered?: boolean;
}

export const CustomCursor: FC<CustomCursorProps> = ({ isHovered = false }) => {
  const cursorPos = useCursorPosition();
  const [isDark, setIsDark] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains("dark"));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.style.cursor === "pointer" ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTrail((prevTrail) => {
        const newTrail = [...prevTrail, { x: cursorPos.x, y: cursorPos.y, id: Date.now() }];
        if (newTrail.length > 8) {
          return newTrail.slice(1);
        }
        return newTrail;
      });
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [cursorPos.x, cursorPos.y]);

  const className = `${styles.customCursor} ${
    isHovered || isHovering ? styles.hover : ""
  } ${isDark ? styles.dark : styles.light}`.trim();

  return (
    <>
      {trail.map((point, index) => (
        <div
          key={point.id}
          className={`${styles.trail} ${isDark ? styles.dark : styles.light}`}
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            opacity: (index + 1) / trail.length * 0.3,
            transform: `translate(-50%, -50%) scale(${(index + 1) / trail.length})`,
          }}
          aria-hidden="true"
        />
      ))}
      <div
        className={className}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
        }}
        aria-hidden="true"
        role="presentation"
      >
        <div className={styles.cursorInner} />
        <div className={styles.cursorGlow} />
      </div>
    </>
  );
};
