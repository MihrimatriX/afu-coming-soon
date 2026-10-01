import type { Metadata } from "next";
import { NotFoundScreen } from "@/components/organisms/not-found-screen";

export const metadata: Metadata = {
  title: "404 — Sinyal Yok | Ahmet Faruk Uzunkaya",
  description: "Aradığın sayfa bu kanalda yayında değil. Ana sayfaya dönerek devam edebilirsin.",
  // layout'taki "index, follow" (googleBot dahil) 404'te geçerli olmasın
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundScreen />;
}
