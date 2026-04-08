import React, { ButtonHTMLAttributes, useCallback, type FC } from "react";
import styles from "./social-link.module.css";

interface SocialLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: "github" | "linkedin" | "email" | "home";
  label: string;
  url: string;
  onHoverChange?: (isHovered: boolean) => void;
  className?: string;
}

export const SocialLink: FC<SocialLinkProps> = ({
  icon,
  label,
  url,
  onHoverChange,
  className = "",
  ...props
}: SocialLinkProps) => {
  const handleClick = useCallback(() => {
    if (typeof window !== "undefined") {
      if (url.startsWith("mailto:")) {
        window.location.href = url;
      } else if (url.startsWith("http")) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    }
  }, [url]);

  const handleMouseEnter = useCallback(() => {
    onHoverChange?.(true);
  }, [onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    onHoverChange?.(false);
  }, [onHoverChange]);

  const getIconClass = () => {
    switch (icon) {
      case "github":
        return "fab fa-github";
      case "linkedin":
        return "fab fa-linkedin";
      case "email":
        return "fas fa-envelope";
      case "home":
        return "fas fa-home";
      default:
        return "";
    }
  };

  return (
    <button
      type="button"
      className={`${styles.socialLink} ${className}`.trim()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
      {...props}
    >
      <div className={styles.iconWrapper}>
        <i className={`${getIconClass()} ${styles.icon}`} aria-hidden="true" />
      </div>
      <span className={styles.label}>{label}</span>
      <div className={styles.hoverOverlay} />
    </button>
  );
};
