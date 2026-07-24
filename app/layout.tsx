import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Briefly — AI PRD Workspace",
  description: "Turn a rough product idea into a focused, editable PRD with DeepSeek.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Briefly — AI PRD Workspace",
    description: "From idea to PRD, in one focused flow.",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "Briefly AI PRD workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Briefly — AI PRD Workspace",
    description: "From idea to PRD, in one focused flow.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
