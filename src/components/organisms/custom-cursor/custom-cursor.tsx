"use client";

import React, { useEffect, useState, useCallback, type FC } from "react";
import { useCursorPosition } from "@/hooks/use-cursor-position";
import styles from "./custom-cursor.module.css";

interface CustomCursorProps {
  isHovered?: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  size: number;
}

interface Particle {
  x: number;
  y: number;
  id: number;
  angle: number;
  distance: number;
  size: number;
}

export const CustomCursor: FC<CustomCursorProps> = ({ isHovered = false }) => {
  const cursorPos = useCursorPosition();
  const [trail, setTrail] = useState<Array<TrailPoint>>([]);
  const [particles, setParticles] = useState<Array<Particle>>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });
  const [clickEffect, setClickEffect] = useState<Array<{ x: number; y: number; id: number }>>([]);

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

    const handleClick = (e: MouseEvent) => {
      setClickEffect((prev) => [
        ...prev,
        { x: e.clientX, y: e.clientY, id: Date.now() },
      ]);
      setTimeout(() => {
        setClickEffect((prev) => prev.slice(1));
      }, 600);
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    const deltaX = cursorPos.x - prevPos.x;
    const deltaY = cursorPos.y - prevPos.y;
    const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    setVelocity({ x: deltaX, y: deltaY });
    setPrevPos({ x: cursorPos.x, y: cursorPos.y });

    const timeoutId = setTimeout(() => {
      setTrail((prevTrail) => {
        const size = Math.min(1 + speed * 0.01, 1.5);
        const newTrail = [
          ...prevTrail,
          { x: cursorPos.x, y: cursorPos.y, id: Date.now(), size },
        ];
        if (newTrail.length > 12) {
          return newTrail.slice(1);
        }
        return newTrail;
      });
    }, 8);

    return () => clearTimeout(timeoutId);
  }, [cursorPos.x, cursorPos.y, prevPos]);

  useEffect(() => {
    const particleCount = isHovering ? 8 : 4;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (360 / particleCount) * i;
      const distance = isHovering ? 20 : 15;
      newParticles.push({
        x: cursorPos.x,
        y: cursorPos.y,
        id: Date.now() + i,
        angle,
        distance,
        size: Math.random() * 3 + 2,
      });
    }
    
    setParticles(newParticles);
  }, [cursorPos.x, cursorPos.y, isHovering]);

  const className = `${styles.customCursor} ${
    isHovered || isHovering ? styles.hover : ""
  } ${styles.light}`.trim();

  return (
    <>
      {trail.map((point, index) => (
        <div
          key={point.id}
          className={`${styles.trail} ${styles.light}`}
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            opacity: (index + 1) / trail.length * 0.4,
            transform: `translate(-50%, -50%) scale(${point.size * (index + 1) / trail.length})`,
            width: `${8 + index * 2}px`,
            height: `${8 + index * 2}px`,
          }}
          aria-hidden="true"
        />
      ))}
      {particles.map((particle) => {
        const radian = (particle.angle * Math.PI) / 180;
        const x = particle.x + Math.cos(radian) * particle.distance;
        const y = particle.y + Math.sin(radian) * particle.distance;
        return (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            aria-hidden="true"
          />
        );
      })}
      {clickEffect.map((effect) => (
        <div
          key={effect.id}
          className={styles.clickRipple}
          style={{
            left: `${effect.x}px`,
            top: `${effect.y}px`,
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
        <div className={styles.cursorAura} />
        <div className={styles.cursorInner}>
          <div className={styles.cursorDot} />
          <div className={styles.cursorCrosshair} />
        </div>
        <div className={styles.cursorGlow} />
        <div className={styles.cursorRing} />
      </div>
    </>
  );
};
