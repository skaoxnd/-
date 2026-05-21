import type { Metadata } from "next";
import "./globals.css";
import { GameProgressProvider } from "@/components/GameProgressProvider";

export const metadata: Metadata = {
  title: "The Invisible Architect",
  description: "데이터 프로파일링 수사 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased dark">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" />
      </head>
      <body className="h-full flex flex-col overflow-hidden text-foreground bg-background">
        <GameProgressProvider>
          {children}
        </GameProgressProvider>
      </body>
    </html>
  );
}
