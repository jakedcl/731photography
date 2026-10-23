import type { ImageLoaderProps } from "next/image";

/** Sanity CDN resizes on their edge — avoids Vercel Image Optimization quota. */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.startsWith("https://cdn.sanity.io/")) {
    return src;
  }
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set(
    "q",
    String(quality || url.searchParams.get("q") || 75),
  );
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
  if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");
  return url.toString();
}
