import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

// mobil tarayıcı çubuğu sayfa arka planıyla (--background) aynı renkte olsun
export const viewport: Viewport = { themeColor: "#0a0a0a" };

// Google başlığı ~60, açıklamayı ~160 karakterde keser; OG/Twitter/JSON-LD de aynı metni kullanır
const SITE_NAME = "Ahmet Faruk Uzunkaya";
const TITLE = "Ahmet Faruk Uzunkaya | Full Stack Developer & Graphics";
const DESCRIPTION =
  "Full Stack Developer, Computer Graphics meraklısı. Web geliştirme, bilgisayar grafikleri ve eğitim içerikleri çok yakında burada. Education. Graphics. Code.";

export const metadata: Metadata = {
  // og:image gibi göreli adresler bu kök adrese göre çözülür
  metadataBase: new URL("https://ahmetfuzunkaya.com"),
  // statik ikon: tarayıcı /favicon.ico aramasın (favicon.js yüklenince bunu canlı ikonla değiştirir)
  icons: { icon: "/favicon.svg" },
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Ahmet Faruk Uzunkaya" }],
  creator: "Ahmet Faruk Uzunkaya",
  publisher: "Ahmet Faruk Uzunkaya",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ahmetfuzunkaya.com",
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Masada retro CRT monitör: PEK YAKINDA — Ahmet Faruk Uzunkaya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://ahmetfuzunkaya.com",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={spaceGrotesk.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Ahmet Faruk Uzunkaya",
                jobTitle: "Full Stack Developer",
                description:
                  "Full Stack Developer, Computer Graphics Enthusiast. Specialized in Education, Graphics, and Code.",
                url: "https://ahmetfuzunkaya.com",
                sameAs: [
                  "https://github.com/MihrimatriX",
                  "https://www.linkedin.com/in/ahmet-fuzunkaya/",
                ],
                email: "ahmet.fuzunkaya@gmail.com",
                knowsAbout: [
                  "Web Development",
                  "Computer Graphics",
                  "Full Stack Development",
                  "Frontend Development",
                  "Backend Development",
                  "Education",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: "https://ahmetfuzunkaya.com",
                description: DESCRIPTION,
                author: {
                  "@type": "Person",
                  name: "Ahmet Faruk Uzunkaya",
                },
                publisher: {
                  "@type": "Person",
                  name: "Ahmet Faruk Uzunkaya",
                },
                inLanguage: "tr-TR",
              },
            ]),
          }}
        />
        {children}
        <Script
          id="favicon-script"
          src="/favicon.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
