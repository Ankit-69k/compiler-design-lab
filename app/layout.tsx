import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compiler Design Lab — Learn Parsing Algorithms Visually",
  description:
    "Interactive educational platform for Compiler Design. Learn FIRST/FOLLOW, LL(1), SLR, LR(0), LR(1), LALR parsing with visualizations, C code, quizzes and practice problems.",
  keywords: [
    "compiler design",
    "parsing",
    "LL1",
    "SLR",
    "LALR",
    "LR parsing",
    "FIRST FOLLOW",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#09091a] text-[#ecedff] antialiased"
      >
        {children}
      </body>
    </html>
  );
}
