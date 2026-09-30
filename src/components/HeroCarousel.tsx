"use client";

import { useEffect, useState } from "react";

import { SanityImage } from "@/components/SanityImage";
import type { SanityImage as SanityImageType } from "@/sanity/lib/types";

type HeroPhoto = {
  _id: string;
  title?: string;
  image?: SanityImageType;
};

const INTERVAL_MS = 5000;

export function HeroCarousel({
  photos,
  fallbackAlt,
}: {
  photos: HeroPhoto[];
  fallbackAlt: string;
}) {
  const slides = photos.filter((p) => p.image?.asset);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900" />
    );
  }

  return (
    <div className="absolute inset-0">
      {slides.map((photo, i) => {
        const active = i === index;
        return (
          <div
            key={photo._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              active ? "opacity-90" : "opacity-0"
            }`}
            aria-hidden={!active}
          >
            <SanityImage
              image={photo.image!}
              alt={photo.title || fallbackAlt}
              width={2400}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        );
      })}
    </div>
  );
}
