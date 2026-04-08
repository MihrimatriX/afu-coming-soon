"use client";

import React, { useCallback, type FC } from "react";
import { Title } from "@/components/atoms/title";
import { SubtitleContainer } from "@/components/organisms/subtitle-container";
import { SocialLinks } from "@/components/organisms/social-links";
import { ScreenEffects } from "@/components/organisms/screen-effects";
import { SystemMessage } from "@/components/organisms/system-message";
import { CustomCursor } from "@/components/organisms/custom-cursor";
import styles from "./page.module.css";

const SOCIAL_LINKS = [
  {
    icon: "home" as const,
    label: "ANASAYFA",
    url: "https://ahmetfuzunkaya.com",
  },
  {
    icon: "github" as const,
    label: "GITHUB",
    url: "https://github.com/MihrimatriX",
  },
  {
    icon: "linkedin" as const,
    label: "LINKEDIN",
    url: "https://www.linkedin.com/in/ahmet-fuzunkaya/",
  },
  {
    icon: "email" as const,
    label: "EMAIL",
    url: "mailto:ahmet.fuzunkaya@gmail.com",
  },
];

const Home: FC = () => {
  const handleHoverChange = useCallback((hovered: boolean) => {
    // Hover state can be used for future enhancements
    console.debug("Hover state:", hovered);
  }, []);

  return (
    <>
      <ScreenEffects />
      <CustomCursor />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.titleSection}>
            <Title variant="main">PEK YAKINDA</Title>
            <SubtitleContainer subtitle="Ahmet Faruk Uzunkaya" isName />
            <SubtitleContainer subtitle="EDUCATION. GRAPHICS. CODE." isTerminal />
          </div>
          <SocialLinks links={SOCIAL_LINKS} onHoverChange={handleHoverChange} />
          <SystemMessage />
        </div>
      </main>
    </>
  );
};

export default Home;
