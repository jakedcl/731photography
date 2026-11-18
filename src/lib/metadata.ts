import type { Metadata } from "next";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://thomaslurker.com"
  );
}

const defaultDescription =
  "Photography by Thomas Lurker — fine art prints and event photography. Sunrises, nature, and cities.";

type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

function defaultOgImage(siteUrl: string): OgImage[] {
  return [
    {
      url: `${siteUrl}/icon.png`,
      width: 512,
      height: 512,
      alt: "731photography",
    },
  ];
}

export function pageMetadata({
  path,
  title,
  description = defaultDescription,
  images,
  robots,
  absoluteTitle,
}: {
  path: string;
  title: string;
  description?: string;
  images?: OgImage[];
  robots?: Metadata["robots"];
  /** Use for the homepage so the root title template is not applied twice. */
  absoluteTitle?: boolean;
}): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = path === "/" ? siteUrl : `${siteUrl}${normalizedPath}`;
  const ogImages = images?.length ? images : defaultOgImage(siteUrl);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((image) => image.url),
    },
    ...(robots !== undefined ? { robots } : {}),
  };
}

export { defaultDescription };