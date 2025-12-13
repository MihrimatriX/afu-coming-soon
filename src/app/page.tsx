"use client";

import { useState, useCallback } from "react";
import type { FC } from "react";
import { Title } from "@/components/atoms/title";
import { SubtitleContainer } from "@/components/organisms/subtitle-container";
import { SocialLinks } from "@/components/organisms/social-links";
import { ScreenEffects } from "@/components/organisms/screen-effects";
import { CustomCursor } from "@/components/organisms/custom-cursor";
import styles from "./page.module.css";

const SUBTITLES = [
  { text: "Computer Graphics..." },
  { text: "Geek Konular..." },
  { text: "Birşeyler Buluruz..." },
];

const SOCIAL_LINKS = [
  {
    icon: "github" as const,
    label: "GITHUB",
    url: "https://github.com/MihrimatriX",
  },
  {
    icon: "linkedin" as const,
    label: "LINKEDIN",
    url: "https://www.linkedin.com/in/ahmet-furkan-gapil/",
  },
  {
    icon: "email" as const,
    label: "EMAIL",
    url: "mailto:afurgapil@gmail.com",
  },
];

const Home: FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverChange = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.screen}>
        <ScreenEffects />
        <div className={styles.content}>
          <Title variant="main">PEK YAKINDA</Title>
          <SubtitleContainer subtitles={SUBTITLES} />
          <SocialLinks links={SOCIAL_LINKS} onHoverChange={handleHoverChange} />
        </div>
      </div>
      <CustomCursor isHovered={isHovered} />
    </main>
  );
};

export default Home;
