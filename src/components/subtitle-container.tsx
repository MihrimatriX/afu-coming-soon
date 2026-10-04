import styles from "./subtitle-container.module.css";

export const SubtitleContainer = ({ subtitle, variant }: { subtitle: string; variant: "name" | "terminal" }) => (
  <div className={`${styles.subtitleContainer} ${styles[variant]}`}>
    <p className={styles.subTitle}>{subtitle}</p>
  </div>
);
