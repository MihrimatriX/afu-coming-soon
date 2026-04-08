import React, { type FC } from "react";
import styles from "./system-message.module.css";

export const SystemMessage: FC = () => {
  return (
    <div className={styles.systemMessage}>
      <p className={styles.text}>
        System initializing... <span className={styles.cursor}>_</span>
      </p>
    </div>
  );
};
