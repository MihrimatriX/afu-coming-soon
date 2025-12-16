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
  title: "Coming Soon | Graphics & Education Blog",
  description: "Full Stack Developer, Computer Graphics Entusiast",
  openGraph: {
    title: "Coming Soon | Graphics & Education Blog",
    description: "Full Stack Developer, Computer Graphics Entusiast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={spaceGrotesk.variable}>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
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
