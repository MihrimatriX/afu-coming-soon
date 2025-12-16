import React, { type FC } from "react";
import styles from "./screen-effects.module.css";

export const ScreenEffects: FC = () => {
  return (
    <>
      <div
        className={styles.screenFlicker}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.scanlines}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.crtOverlay}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.radialGradient}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.screenNoise}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.chromaticAberration}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.colorBleeding}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.horizontalDistortion}
        aria-hidden="true"
        role="presentation"
      />
      <div
        className={styles.crtVignette}
        aria-hidden="true"
        role="presentation"
      />
    </>
  );
};
