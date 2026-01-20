import { Providers } from "./providers";

import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "7 Team Temporary FE",
  description: "7 Team Temporary Frontend Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
