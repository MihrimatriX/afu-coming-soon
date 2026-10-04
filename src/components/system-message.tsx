import styles from "./system-message.module.css";

export const SystemMessage = ({ text }: { text: string }) => (
  <div className={styles.systemMessage}>
    <p className={styles.text}>
      {text} <span className={styles.cursor}>_</span>
    </p>
  </div>
);
