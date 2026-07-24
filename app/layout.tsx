import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://briefly-prd-ai.nammusomepalli.chatgpt.site"),
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
      <body>{children}</body>
    </html>
  );
}
