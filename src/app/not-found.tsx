import type { Metadata } from "next";
import { CrtPage } from "@/components/crt-page";
import { SOCIAL_LINKS } from "@/constants/social-links";

export const metadata: Metadata = {
  title: "404 — Sinyal Yok | Ahmet Faruk Uzunkaya",
  description: "Aradığın sayfa bu kanalda yayında değil. Ana sayfaya dönerek devam edebilirsin.",
  // layout'taki "index, follow" (googleBot dahil) 404'te geçerli olmasın
  robots: { index: false, follow: true },
};

// Ana sayfayla aynı sahne; ekranda 404 yazar
const TEXT = {
  title: "404",
  subtitle: "SAYFA BULUNAMADI",
  tagline: "KANAL 404 // SİNYAL YOK",
  status: "Signal lost...",
};

// ANASAYFA bağlantısı yeni sekme açmasın, aynı sekmede ana sayfaya dönsün
const LINKS = SOCIAL_LINKS.map((l) => (l.icon === "home" ? { ...l, url: "/" } : l));

export default function NotFound() {
  return <CrtPage text={TEXT} links={LINKS} />;
}
