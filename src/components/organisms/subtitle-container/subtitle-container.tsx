import React, { type FC } from "react";
import { Title } from "@/components/atoms/title";
import styles from "./subtitle-container.module.css";

interface SubtitleContainerProps {
  subtitle: string;
}

export const SubtitleContainer: FC<SubtitleContainerProps> = ({ subtitle }) => {
  return (
    <div className={styles.subtitleContainer}>
      <Title as="p" variant="sub" prefix=">">
        {subtitle}
      </Title>
    </div>
  );
};
