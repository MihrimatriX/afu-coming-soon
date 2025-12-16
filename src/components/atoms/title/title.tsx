"use client";

import React, { useEffect, useState, type HTMLAttributes, type FC } from "react";
import styles from "./title.module.css";

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  variant?: "main" | "sub";
  children: string;
  className?: string;
  prefix?: string;
}

export const Title: FC<TitleProps> = ({
  as: Component = "h1",
  variant = "main",
  children,
  className = "",
  prefix,
  ...props
}) => {
  const [isDark, setIsDark] = useState(false);

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

  if (variant === "main") {
    return (
      <div className={styles.glitchWrapper}>
        <Component
          className={`${styles.mainTitle} ${className}`}
          data-text={children}
          style={
            isDark
              ? {
                  color: "#ffffff",
                  filter: "brightness(1.2) blur(0)",
                  WebkitFilter: "brightness(1.2) blur(0)",
                  WebkitTextFillColor: "#ffffff",
                }
              : undefined
          }
          {...props}
        >
          {children}
        </Component>
      </div>
    );
  }

  return (
    <Component className={`${styles.subTitle} ${className}`} {...props}>
      {prefix && <span className={styles.subTitlePrefix}>{prefix}</span>}
      {children}
    </Component>
  );
};
