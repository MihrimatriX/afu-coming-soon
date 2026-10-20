import { Icon } from "@/components/icon";
import type { SocialLinkData } from "@/constants/social-links";
import styles from "./social-links.module.css";

export const SocialLinks = ({ links }: { links: SocialLinkData[] }) => (
  <nav className={styles.socialLinks} aria-label="Social media links">
    {links.map(({ icon, label, url }) => {
      // Dış siteler yeni sekmede; mailto ve site içi ("/") aynı sekmede
      const external = url.startsWith("http");
      return (
        <a
          key={url}
          href={url}
          className={styles.socialLink}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          <div className={styles.iconWrapper}>
            <Icon name={icon} className={styles.icon} />
          </div>
          <span className={styles.label}>{label}</span>
          <div className={styles.hoverOverlay} />
        </a>
      );
    })}
  </nav>
);
