import React, { type FC } from "react";
import { Title } from "@/components/atoms/title";
import { useSubtitleRotation } from "@/hooks/use-subtitle-rotation";
import styles from "./subtitle-container.module.css";

interface Subtitle {
  text: string;
}

interface SubtitleContainerProps {
  subtitles: Subtitle[];
}

export const SubtitleContainer: FC<SubtitleContainerProps> = ({ subtitles }) => {
  useSubtitleRotation();

  return (
    <div className={styles.subtitleContainer} aria-live="polite">
      {subtitles.map((subtitle) => (
        <Title key={subtitle.text} as="h2" variant="sub">
          {subtitle.text}
        </Title>
      ))}
    </div>
  );
};
