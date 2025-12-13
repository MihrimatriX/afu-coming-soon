import React, { ButtonHTMLAttributes, useCallback, type FC } from "react";
import { Icon } from "@/components/atoms/icon";
import styles from "./social-link.module.css";

interface SocialLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: "github" | "linkedin" | "email";
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
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [url]);

  const handleMouseEnter = useCallback(() => {
    onHoverChange?.(true);
  }, [onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    onHoverChange?.(false);
  }, [onHoverChange]);

  return (
    <button
      type="button"
      className={`${styles.socialLink} ${className}`.trim()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-text={label}
      aria-label={label}
      {...props}
    >
      <div className={styles.iconWrapper}>
        <Icon name={icon} className={styles.icon} />
      </div>
      {label}
    </button>
  );
};
