"use client";

import React, { useEffect, useState, useRef, type FC } from "react";
import { useCursorPosition } from "@/hooks/use-cursor-position";
import styles from "./custom-cursor.module.css";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
}

export const CustomCursor: FC = () => {
  const cursorPos = useCursorPosition();
  const [isHovering, setIsHovering] = useState(false);
  const [showContextMessage, setShowContextMessage] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.left = `${cursorPos.x}px`;
      cursorRef.current.style.top = `${cursorPos.y}px`;
    }
  }, [cursorPos.x, cursorPos.y]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        !!target.closest("button, a") ||
        window.getComputedStyle(target).cursor === "pointer"
      );
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", () => setIsHovering(false), { passive: true });
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", () => setIsHovering(false));
    };
  }, []);

  useEffect(() => {
    let messageTimeout: NodeJS.Timeout | null = null;
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      // Önceki animasyonu temizle
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      
      // Konfeti oluştur
      const particles: ConfettiParticle[] = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          angle: (Math.PI * 2 * i) / 30 + Math.random() * 0.5,
          velocity: 2 + Math.random() * 3,
          size: 4 + Math.random() * 6,
        });
      }
      setConfetti(particles);
      setShowContextMessage(true);
      
      // Konfeti animasyonu
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 2000) {
          setConfetti((prev) => {
            if (prev.length === 0) return prev;
            return prev
              .map((p) => ({
                ...p,
                x: p.x + Math.cos(p.angle) * p.velocity * 2,
                y: p.y + Math.sin(p.angle) * p.velocity * 2 + elapsed * 0.05,
                velocity: p.velocity * 0.98,
              }))
              .filter((p) => p.velocity > 0.1);
          });
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setConfetti([]);
          animationFrameRef.current = null;
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
      
      messageTimeout = setTimeout(() => {
        setShowContextMessage(false);
        messageTimeout = null;
      }, 4000);
    };

    window.addEventListener("contextmenu", handleContextMenu, { passive: false });
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, []);

  return (
    <>
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className={styles.confettiParticle}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          aria-hidden="true"
        />
      ))}
      <div
        ref={cursorRef}
        className={`${styles.customCursor} ${isHovering ? styles.hover : ""} ${styles.light}`}
        aria-hidden="true"
      >
        <div className={styles.cursorInner}>
          <div className={styles.cursorDot} />
        </div>
      </div>
      {showContextMessage && (
        <div
          className={styles.contextMessage}
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y + 30}px`,
          }}
        >
          <span>Burayı geliştirmek için uğraşıyorum umarım kafamdaki gibi olur</span>
        </div>
      )}
    </>
  );
};
