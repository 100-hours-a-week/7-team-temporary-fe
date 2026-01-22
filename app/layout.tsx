import { Providers } from "./providers";
import { pretendard } from "./fonts";

import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOLIB",
  description: "molib",
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
