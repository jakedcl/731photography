import type { Metadata } from "next";

import { SanityLive } from "@/sanity/lib/live";

import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://thomaslurker.com";

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
    url: siteUrl,
    siteName: "731photography",
    title: "Thomas Lurker | 731photography",
    description:
      "Fine art prints and event photography by Thomas Lurker — sunrises, nature, and cities.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thomas Lurker | 731photography",
    description:
      "Fine art prints and event photography by Thomas Lurker — sunrises, nature, and cities.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
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
