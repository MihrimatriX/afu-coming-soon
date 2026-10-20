import styles from "./title.module.css";

// Glitch efektli ana başlık; ::before/::after kopyaları data-text'ten gelir
export const Title = ({ children }: { children: string }) => (
  <div className={styles.glitchWrapper}>
    <h1 className={styles.mainTitle} data-text={children}>
      {children}
    </h1>
  </div>
);
