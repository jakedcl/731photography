export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-08-06";

// Public identifiers — safe to default so Studio still boots if Vercel env is incomplete
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "g8r5pz57";
