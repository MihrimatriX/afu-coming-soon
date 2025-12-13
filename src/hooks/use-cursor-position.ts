import { useState, useEffect, useCallback } from "react";

interface CursorPosition {
  x: number;
  y: number;
}

export const useCursorPosition = (): CursorPosition => {
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: 0, y: 0 });

  const updateCursorPosition = useCallback((e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    document.body.style.cursor = "none";
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => updateCursorPosition(e));
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateCursorPosition]);

  return cursorPos;
};
