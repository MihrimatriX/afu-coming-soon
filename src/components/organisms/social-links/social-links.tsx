import React, { useCallback, type FC } from "react";
import { SocialLink } from "@/components/molecules/social-link";
import styles from "./social-links.module.css";

interface SocialLinkData {
  icon: "github" | "linkedin" | "email" | "home";
  label: string;
  url: string;
}

interface SocialLinksProps {
  links: SocialLinkData[];
  onHoverChange?: (isHovered: boolean) => void;
}

export const SocialLinks: FC<SocialLinksProps> = ({ links, onHoverChange }) => {
  const handleHoverChange = useCallback(
    (hovered: boolean) => {
      onHoverChange?.(hovered);
    },
    [onHoverChange]
  );

  return (
    <nav className={styles.socialLinks} aria-label="Social media links">
      {links.map((link) => (
        <SocialLink
          key={link.url}
          icon={link.icon}
          label={link.label}
          url={link.url}
          onHoverChange={handleHoverChange}
        />
      ))}
    </nav>
  );
};
