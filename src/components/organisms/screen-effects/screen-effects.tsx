import React, { type FC } from "react";
import styles from "./screen-effects.module.css";

export const ScreenEffects: FC = () => {
  return (
    <>
      <div className={styles.screenGlass} aria-hidden="true" role="presentation" />
      <div className={styles.scanlines} aria-hidden="true" role="presentation" />
      <div className={styles.noise} aria-hidden="true" role="presentation" />
    </>
  );
};
