import React, { type HTMLAttributes, type FC } from "react";
import styles from "./title.module.css";

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: "main" | "sub";
  children: string;
  className?: string;
}

export const Title: FC<TitleProps> = ({
  as: Component = "h1",
  variant = "main",
  children,
  className = "",
  ...props
}) => {
  const variantClass = variant === "main" ? styles.mainTitle : styles.subTitle;

  return (
    <Component
      className={`${variantClass} ${className || ""}`}
      data-text={children}
      {...props}
    >
      {children}
    </Component>
  );
};
