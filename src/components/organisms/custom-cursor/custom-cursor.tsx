import React, { type FC } from "react";
import { useCursorPosition } from "@/hooks/use-cursor-position";
import styles from "./custom-cursor.module.css";

interface CustomCursorProps {
  isHovered?: boolean;
}

export const CustomCursor: FC<CustomCursorProps> = ({ isHovered = false }) => {
  const cursorPos = useCursorPosition();

  const className = `${styles.customCursor} ${
    isHovered ? styles.hover : ""
  }`.trim();

  return (
    <div
      className={className}
      style={{
        left: `${cursorPos.x}px`,
        top: `${cursorPos.y}px`,
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
};
