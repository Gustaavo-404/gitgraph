import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitGraph – Advanced GitHub Analytics",
  description:
    "Analyze GitHub repositories through interactive dashboards, contributor insights, language metrics, commit history and exportable reports.",

  keywords: [
    "GitHub",
    "Analytics",
    "Repository",
    "Dashboard",
    "Next.js",
    "Open Source",
    "Developer Tools",
    "GitGraph",
  ],

  authors: [
    {
      name: "Gustavo Medeiros de Barros",
    },
  ],

  creator: "Gustavo Medeiros de Barros",

  metadataBase: new URL("https://gitgraph.com.br"),

  openGraph: {
    title: "GitGraph",
    description:
      "Advanced analytics platform for GitHub repositories.",
    url: "https://gitgraph.com.br",
    siteName: "GitGraph",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "GitGraph",
    description:
      "Advanced analytics platform for GitHub repositories.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
