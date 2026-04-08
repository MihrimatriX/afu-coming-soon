import { useEffect, useRef } from "react";
import styles from "@/components/atoms/title/title.module.css";

export const useSubtitleRotation = () => {
  const subtitlesRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const subtitleElements = document.querySelectorAll(
      `h2[data-text]`
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

  return subtitlesRef;
};
