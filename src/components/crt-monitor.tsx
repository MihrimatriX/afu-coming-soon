import type { ReactNode } from "react";
import { CrtTube } from "@/components/screen-effects";
import styles from "./crt-monitor.module.css";

// WebGL yoksa (mobil dahil) gösterilen CSS monitör; içerik bükülmüş tüpün içinde
export const CrtMonitor = ({ children }: { children: ReactNode }) => (
  <div className={styles.scene}>
    <div className={styles.rig}>
      <div className={styles.front}>
        <div className={styles.bezel}>
          <div className={styles.screen}>
            <CrtTube className={styles.tube}>{children}</CrtTube>
          </div>
        </div>
        <div className={styles.chin} aria-hidden="true">
          <span className={styles.badge}>AFU-80</span>
          <span className={styles.grille} />
          <span className={styles.panel}>
            <span className={styles.knob} />
            <span className={styles.knob} />
            <span className={styles.power} />
            <span className={styles.led} />
          </span>
        </div>
      </div>
    </div>
  </div>
);
