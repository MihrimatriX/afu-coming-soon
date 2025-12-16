import React, { type FC } from "react";
import { Title } from "@/components/atoms/title";
import styles from "./subtitle-container.module.css";

interface SubtitleContainerProps {
  subtitle: string;
  isTerminal?: boolean;
  isName?: boolean;
}

export const SubtitleContainer: FC<SubtitleContainerProps> = ({
  subtitle,
  isTerminal = false,
  isName = false,
}) => {
  return (
    <div
      className={`${styles.subtitleContainer} ${
        isTerminal ? styles.terminal : ""
      } ${isName ? styles.name : ""}`.trim()}
    >
      <Title as="p" variant="sub">
        {subtitle}
      </Title>
    </div>
  );
};
