import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmet Faruk Uzunkaya",
  description: "Full Stack Developer, Computer Graphics Entusiast",
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
      </body>
    </html>
  );
}
