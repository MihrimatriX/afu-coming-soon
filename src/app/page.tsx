"use client";
import styles from "./page.module.css";
import { useEffect, useState, useCallback, useRef } from "react";

export default function Home() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const subtitlesRef = useRef<HTMLElement[]>([]);

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

  useEffect(() => {
    const subtitleElements = document.querySelectorAll(
      `.${styles.subTitle}`
    ) as NodeListOf<HTMLElement>;
    subtitlesRef.current = Array.from(subtitleElements);

    subtitlesRef.current.forEach((subtitle) => {
      subtitle.classList.remove(styles.active);
    });

    if (subtitlesRef.current.length > 0) {
      subtitlesRef.current[0].classList.add(styles.active);
    }

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (subtitlesRef.current[currentIndex]) {
        subtitlesRef.current[currentIndex].classList.remove(styles.active);
      }

      currentIndex = (currentIndex + 1) % subtitlesRef.current.length;

      if (subtitlesRef.current[currentIndex]) {
        subtitlesRef.current[currentIndex].classList.add(styles.active);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <main className={styles.main}>
      <div className={styles.screen}>
        <div className={styles.screenGlass}></div>
        <div className={styles.scanlines}></div>
        <div className={styles.noise}></div>
        <div className={styles.content}>
          <h1 className={styles.mainTitle} data-text="PEK YAKINDA">
            PEK YAKINDA
          </h1>
          <div className={styles.subtitleContainer}>
            <h2 className={styles.subTitle} data-text="Computer Graphics...">
              Computer Graphics...
            </h2>
            <h2 className={styles.subTitle} data-text="Geek Konular...">
              Geek Konular...
            </h2>
            <h2 className={styles.subTitle} data-text="Birşeyler Buluruz...">
              Birşeyler Buluruz...
            </h2>
          </div>
          <div className={styles.socialLinks}>
            <button
              className={styles.socialLink}
              onClick={() => handleLinkClick("https://github.com/MihrimatriX")}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              data-text="GITHUB"
            >
              <div className={styles.iconWrapper}>
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
              </div>
              GITHUB
            </button>
            <button
              className={styles.socialLink}
              onClick={() =>
                handleLinkClick(
                  "https://www.linkedin.com/in/ahmet-furkan-gapil/"
                )
              }
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              data-text="LINKEDIN"
            >
              <div className={styles.iconWrapper}>
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              LINKEDIN
            </button>
            <button
              className={styles.socialLink}
              onClick={() => handleLinkClick("mailto:afurgapil@gmail.com")}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              data-text="EMAIL"
            >
              <div className={styles.iconWrapper}>
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </div>
              EMAIL
            </button>
          </div>
        </div>
      </div>
      <div
        className={`${styles.customCursor} ${isHovered ? styles.hover : ""}`}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
        }}
      />
    </main>
  );
}
