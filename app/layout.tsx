import { Providers } from "./providers";
import { pretendard } from "./fonts";

import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "MOLIP",
  description: "molip",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-v2.svg",
  },
  appleWebApp: {
    capable: true,
    title: "MOLIP",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8F8F8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={pretendard.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
