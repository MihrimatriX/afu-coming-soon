"use client";

import React, { type HTMLAttributes, type FC } from "react";
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
  if (variant === "main") {
    return (
      <div className={styles.glitchWrapper}>
        <Component
          className={`${styles.mainTitle} ${className}`}
          data-text={children}
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
