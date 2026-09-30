import Image from "next/image";

import { urlFor } from "@/sanity/lib/image";
import type { SanityImage as SanityImageType } from "@/sanity/lib/types";

type Props = {
  image: SanityImageType;
  alt?: string;
  width: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  /** Keep the photo’s real proportions — no forced crop. */
  natural?: boolean;
};

export function SanityImage({
  image,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
  fill,
  natural = false,
}: Props) {
  if (!image?.asset) return null;

  const resolvedAlt = alt || image.alt || "";
  const sourceW = image.asset.metadata?.dimensions?.width ?? 3;
  const sourceH = image.asset.metadata?.dimensions?.height ?? 2;
  const aspect =
    height ?? Math.round(width / (sourceW / sourceH));

  const src = fill
    ? urlFor(image).width(2400).quality(82).url()
    : natural
      ? urlFor(image).width(width).quality(82).url()
      : urlFor(image).width(width).height(aspect).fit("crop").quality(82).url();

  const blur = image.asset.metadata?.lqip;

  if (fill) {
    return (
      <Image
        src={src}
        alt={resolvedAlt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={resolvedAlt}
      width={width}
      height={aspect}
      className={className}
      priority={priority}
      sizes={sizes}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
    />
  );
}
