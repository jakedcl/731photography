import type { Metadata } from "next";

import { SanityLive } from "@/sanity/lib/live";

import "./globals.css";

import { getSiteUrl } from "@/lib/metadata";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Thomas Lurker | 731photography",
    template: "%s | Thomas Lurker",
  },
  description:
    "Photography by Thomas Lurker — fine art prints and event photography. Sunrises, nature, and cities.",
  applicationName: "731photography",
  authors: [{ name: "Thomas Lurker" }],
  creator: "Thomas Lurker",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "731photography",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--paper)] text-stone-900">
        {children}
        <SanityLive />
      </body>
    </html>
  );
}
