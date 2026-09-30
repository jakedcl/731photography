import { defineQuery } from "next-sanity";

const imageFields = /* groq */ `
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions { width, height }
    }
  },
  alt,
  hotspot,
  crop
`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "siteSettings"][0]{
    siteTitle,
    brandName,
    tagline,
    about,
    inquiryEmail
  }
`);

export const PRINT_SIZES_QUERY = defineQuery(/* groq */ `
  *[_id == "printSizes"][0]{
    sizes[active != false]{
      _key,
      label,
      "sku": sku.current,
      priceCents,
      prodigiSku
    }
  }
`);

export const PHOTOS_QUERY = defineQuery(/* groq */ `
  *[_type == "photo" && defined(slug.current) && defined(image.asset)]
  | order(sortOrder asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    caption,
    forSale,
    featured,
    sortOrder,
    printShape,
    image { ${imageFields} }
  }
`);

/** All featured photos for the homepage hero rotation (ordered). */
export const FEATURED_PHOTOS_QUERY = defineQuery(/* groq */ `
  *[_type == "photo" && featured == true && defined(image.asset)]
  | order(sortOrder asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    image { ${imageFields} }
  }
`);

/** First featured, else first photo — used for OG / single-image fallbacks. */
export const FEATURED_PHOTO_QUERY = defineQuery(/* groq */ `
  coalesce(
    *[_type == "photo" && featured == true && defined(image.asset)]
      | order(sortOrder asc, _createdAt desc)[0],
    *[_type == "photo" && defined(image.asset)]
      | order(sortOrder asc, _createdAt desc)[0]
  ){
    _id,
    title,
    "slug": slug.current,
    image { ${imageFields} }
  }
`);

export const PHOTO_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "photo" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    caption,
    forSale,
    featured,
    printShape,
    image { ${imageFields} }
  }
`);

export const PHOTO_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "photo" && defined(slug.current)]{ "slug": slug.current }
`);
