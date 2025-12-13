import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Ahmet Faruk Uzunkaya",
  description: "Full Stack Developer, Computer Graphics Entusiast",
  openGraph: {
    title: "Ahmet Faruk Uzunkaya",
    description: "Full Stack Developer, Computer Graphics Entusiast",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
