import React, { type FC } from "react";
import styles from "./system-message.module.css";

export const SystemMessage: FC<{ text?: string }> = ({ text = "System initializing..." }) => {
  return (
    <div className={styles.systemMessage}>
      <p className={styles.text}>
        {text} <span className={styles.cursor}>_</span>
      </p>
    </div>
  );
};
