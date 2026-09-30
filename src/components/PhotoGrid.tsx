import Link from "next/link";

import { SanityImage } from "@/components/SanityImage";
import type { PhotoListItem } from "@/sanity/lib/types";

export function PhotoGrid({
  photos,
  fromPrice,
  lead = false,
}: {
  photos: PhotoListItem[];
  fromPrice?: string;
  /** First image opens the gallery full-width. */
  lead?: boolean;
}) {
  if (!photos.length) {
    return (
      <p className="py-16 text-stone-500">
        No prints yet. Photos added in Studio will show up here.
      </p>
    );
  }

  const [first, ...rest] = photos;
  const masonry = lead ? rest : photos;

  return (
    <div>
      {lead && first ? (
        <FeaturedPrint photo={first} fromPrice={fromPrice} />
      ) : null}

      <ul className="print-masonry">
        {masonry.map((photo, index) => (
          <li key={photo._id} className="print-masonry-item">
            <PrintCard
              photo={photo}
              fromPrice={fromPrice}
              priority={!lead && index < 2}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturedPrint({
  photo,
  fromPrice,
}: {
  photo: PhotoListItem;
  fromPrice?: string;
}) {
  return (
    <Link
      href={`/prints/${photo.slug}`}
      className="group relative mb-4 block overflow-hidden bg-stone-900 sm:mb-5 md:mb-6"
    >
      {photo.image ? (
        <SanityImage
          image={photo.image}
          alt={photo.title || "Photograph"}
          width={2000}
          natural
          priority
          className="h-auto w-full transition duration-700 ease-out group-hover:scale-[1.015]"
          sizes="100vw"
        />
      ) : (
        <div className="aspect-[16/10] bg-stone-800" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/65">
            Featured
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-4xl">
            {photo.title}
          </h2>
        </div>
        <Meta photo={photo} fromPrice={fromPrice} light />
      </div>
    </Link>
  );
}

function PrintCard({
  photo,
  fromPrice,
  priority,
}: {
  photo: PhotoListItem;
  fromPrice?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/prints/${photo.slug}`}
      className="group relative block overflow-hidden bg-stone-900"
    >
      {photo.image ? (
        <SanityImage
          image={photo.image}
          alt={photo.title || "Photograph"}
          width={1200}
          natural
          priority={priority}
          className="h-auto w-full transition duration-700 ease-out group-hover:scale-[1.025]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="aspect-[4/5] bg-stone-800" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-90 transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-3 p-4">
        <h2 className="text-[15px] font-medium tracking-tight text-white">
          {photo.title}
        </h2>
        <Meta photo={photo} fromPrice={fromPrice} light />
      </div>
    </Link>
  );
}

function Meta({
  photo,
  fromPrice,
  light,
}: {
  photo: PhotoListItem;
  fromPrice?: string;
  light?: boolean;
}) {
  if (photo.forSale === false) {
    return (
      <span
        className={`text-[10px] uppercase tracking-[0.14em] ${
          light ? "text-white/55" : "text-stone-400"
        }`}
      >
        Display only
      </span>
    );
  }
  if (!fromPrice) return null;
  return (
    <span
      className={`shrink-0 text-sm tabular-nums ${
        light ? "text-white/80" : "text-stone-500"
      }`}
    >
      From {fromPrice}
    </span>
  );
}
