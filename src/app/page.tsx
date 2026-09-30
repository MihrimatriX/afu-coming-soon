"use client";

import React, { type FC } from "react";
import { Title } from "@/components/atoms/title";
import { SubtitleContainer } from "@/components/organisms/subtitle-container";
import { SocialLinks } from "@/components/organisms/social-links";
import { ScreenEffects } from "@/components/organisms/screen-effects";
import { CrtMonitor } from "@/components/organisms/crt-monitor";
import { SystemMessage } from "@/components/organisms/system-message";
import { CustomCursor } from "@/components/organisms/custom-cursor";
import { CrtScene } from "@/components/organisms/crt-scene";
import { BootScreen } from "@/components/organisms/boot-screen";
import { useScene3d } from "@/hooks/use-scene-3d";
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
  // Masaüstü + WebGL: gerçek 3B sahne. Mobil ya da WebGL yoksa: CSS sürümü.
  const scene3d = useScene3d();

  return (
    <>
      {/* 3B sahnede imleç gerçek bir el; yeşil halka yalnızca CSS sürümünde */}
      {scene3d !== true && <CustomCursor />}
      {scene3d && <CrtScene links={SOCIAL_LINKS} />}
      {/* 3B sahne hazırlanırken retro açılış ekranı; mobilde CSS ile gizli */}
      <BootScreen active={scene3d !== false} />
      {scene3d !== false && (
        // 3B sahnede içerik canvas'a çizilir; ekran okuyucular ve arama motorları için gerçek metin de sayfada durur
        <main className="sr-only">
          <h1>PEK YAKINDA</h1>
          <p>Ahmet Faruk Uzunkaya — Education. Graphics. Code.</p>
          <nav aria-label="Social media links">
            {SOCIAL_LINKS.map((l) => (
              <a key={l.url} href={l.url}>
                {l.label}
              </a>
            ))}
          </nav>
        </main>
      )}
      {scene3d === false && (
        <CrtMonitor>
          <ScreenEffects />
          <main className={styles.main}>
            <div className={styles.content}>
              <div className={styles.titleSection}>
                <Title variant="main">PEK YAKINDA</Title>
                <SubtitleContainer subtitle="Ahmet Faruk Uzunkaya" isName />
                <SubtitleContainer subtitle="EDUCATION. GRAPHICS. CODE." isTerminal />
              </div>
              <SocialLinks links={SOCIAL_LINKS} />
              <SystemMessage />
            </div>
          </main>
        </CrtMonitor>
      )}
    </>
  );
};

export default Home;
