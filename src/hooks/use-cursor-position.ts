import { useEffect, useState } from "react";

// İmleç gizleme globals.css'te (cursor: none !important); burada yalnızca konum
export const useCursorPosition = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }));
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return pos;
};
