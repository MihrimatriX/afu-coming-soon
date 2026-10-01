"use client";

import React, { type FC } from "react";
import { Title } from "@/components/atoms/title";
import { SubtitleContainer } from "@/components/organisms/subtitle-container";
import { SocialLinks } from "@/components/organisms/social-links";
import { ScreenEffects } from "@/components/organisms/screen-effects";
import { CrtMonitor } from "@/components/organisms/crt-monitor";
import { SystemMessage } from "@/components/organisms/system-message";
import { CustomCursor } from "@/components/organisms/custom-cursor";
import { CrtScene, type ScreenText } from "@/components/organisms/crt-scene";
import { BootScreen } from "@/components/organisms/boot-screen";
import { useScene3d } from "@/hooks/use-scene-3d";
import type { SocialLinkData } from "@/constants/social-links";
import styles from "./crt-page.module.css";

type Props = {
  text: ScreenText;
  links: SocialLinkData[];
};

// Masadaki CRT monitör sahnesi; ekrandaki metinler ve bağlantılar sayfaya göre değişir (ana sayfa, 404)
export const CrtPage: FC<Props> = ({ text, links }) => {
  // Masaüstü + WebGL: gerçek 3B sahne. Mobil ya da WebGL yoksa: CSS sürümü.
  const scene3d = useScene3d();

  return (
    <>
      {/* 3B sahnede imleç gerçek bir el; yeşil halka yalnızca CSS sürümünde */}
      {scene3d !== true && <CustomCursor />}
      {scene3d && <CrtScene links={links} text={text} />}
      {/* 3B sahne hazırlanırken retro açılış ekranı; mobilde CSS ile gizli */}
      <BootScreen active={scene3d !== false} />
      {scene3d !== false && (
        // 3B sahnede içerik canvas'a çizilir; ekran okuyucular ve arama motorları için gerçek metin de sayfada durur
        <main className="sr-only">
          <h1>{text.title}</h1>
          <p>
            {text.subtitle} — {text.tagline}
          </p>
          <nav aria-label="Social media links">
            {links.map((l) => (
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
                <Title variant="main">{text.title}</Title>
                <SubtitleContainer subtitle={text.subtitle} isName />
                <SubtitleContainer subtitle={text.tagline} isTerminal />
              </div>
              <SocialLinks links={links} />
              <SystemMessage text={text.status} />
            </div>
          </main>
        </CrtMonitor>
      )}
    </>
  );
};
