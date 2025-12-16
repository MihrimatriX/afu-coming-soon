import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Ahmet Faruk Uzunkaya | Kişisel Blog & Website - Full Stack Developer",
  description:
    "Ahmet Faruk Uzunkaya'nın kişisel blog ve websitesi. Full Stack Developer, Computer Graphics Enthusiast. Web development, computer graphics, eğitim içerikleri ve teknoloji yazıları. Education, Graphics, Code.",
  keywords: [
    "Ahmet Faruk Uzunkaya",
    "Ahmet Faruk Uzunkaya blog",
    "Ahmet Faruk Uzunkaya website",
    "Full Stack Developer",
    "Full Stack Developer blog",
    "Computer Graphics",
    "Web Development",
    "Web Development blog",
    "Education",
    "Graphics",
    "Code",
    "Next.js",
    "React",
    "TypeScript",
    "Frontend Developer",
    "Backend Developer",
    "Kişisel blog",
    "Teknoloji blogu",
    "Programlama blogu",
    "Web geliştirme",
    "Bilgisayar grafikleri",
    "Yazılım geliştirme",
    "Software Development",
    "Personal Blog",
    "Tech Blog",
  ],
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
    title: "Ahmet Faruk Uzunkaya | Kişisel Blog & Website - Full Stack Developer",
    description:
      "Ahmet Faruk Uzunkaya'nın kişisel blog ve websitesi. Full Stack Developer, Computer Graphics Enthusiast. Web development, computer graphics ve teknoloji yazıları.",
    siteName: "Ahmet Faruk Uzunkaya - Kişisel Blog",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ahmet Faruk Uzunkaya - Full Stack Developer Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmet Faruk Uzunkaya | Kişisel Blog & Website",
    description:
      "Full Stack Developer, Computer Graphics Enthusiast. Kişisel blog ve teknoloji yazıları. Education, Graphics, Code.",
    creator: "@ahmetfuzunkaya",
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
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
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
                name: "Ahmet Faruk Uzunkaya - Kişisel Blog",
                url: "https://ahmetfuzunkaya.com",
                description:
                  "Ahmet Faruk Uzunkaya'nın kişisel blog ve websitesi. Full Stack Developer, Computer Graphics Enthusiast.",
                author: {
                  "@type": "Person",
                  name: "Ahmet Faruk Uzunkaya",
                },
                publisher: {
                  "@type": "Person",
                  name: "Ahmet Faruk Uzunkaya",
                },
                inLanguage: "tr-TR",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://ahmetfuzunkaya.com/search?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Blog",
                name: "Ahmet Faruk Uzunkaya Blog",
                url: "https://ahmetfuzunkaya.com",
                description:
                  "Full Stack Developer, Computer Graphics ve Web Development konularında yazılar, eğitim içerikleri ve teknoloji paylaşımları.",
                author: {
                  "@type": "Person",
                  name: "Ahmet Faruk Uzunkaya",
                },
                publisher: {
                  "@type": "Person",
                  name: "Ahmet Faruk Uzunkaya",
                },
                inLanguage: "tr-TR",
                about: [
                  "Web Development",
                  "Computer Graphics",
                  "Full Stack Development",
                  "Education",
                  "Programming",
                ],
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
