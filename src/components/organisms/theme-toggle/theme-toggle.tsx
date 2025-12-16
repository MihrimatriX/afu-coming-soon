"use client";

import React, { useEffect, useState, type FC } from "react";
import styles from "./theme-toggle.module.css";

export const ThemeToggle: FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const htmlElement = document.documentElement;
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (theme === "dark" || (!theme && prefersDark)) {
      htmlElement.classList.add("dark");
      setIsDark(true);
    } else {
      htmlElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const handleToggle = () => {
    const htmlElement = document.documentElement;
    const newIsDark = !isDark;

    if (newIsDark) {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setIsDark(newIsDark);
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      <i
        className={`fas fa-sun ${styles.sunIcon} ${
          !isDark ? styles.visible : styles.hidden
        }`}
        aria-hidden="true"
      />
      <i
        className={`fas fa-moon ${styles.moonIcon} ${
          isDark ? styles.visible : styles.hidden
        }`}
        aria-hidden="true"
      />
    </button>
  );
};
