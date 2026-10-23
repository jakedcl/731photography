"use client";

import Image, { type ImageProps } from "next/image";

import sanityImageLoader from "@/lib/sanityImageLoader";

function useSanityLoader(src: ImageProps["src"]): boolean {
  return typeof src === "string" && src.startsWith("https://cdn.sanity.io/");
}

export function SanityNextImage(props: ImageProps) {
  const sanity = useSanityLoader(props.src);
  return (
    // alt and other a11y props are passed through {...props}
    // eslint-disable-next-line jsx-a11y/alt-text -- forwarded from callers
    <Image {...props} loader={sanity ? sanityImageLoader : undefined} />
  );
}
