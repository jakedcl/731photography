import { SiteFooter, SiteHeaderSolid } from "@/components/SiteChrome";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: settings } = await sanityFetch({
    query: SITE_SETTINGS_QUERY,
  });

  const site = (settings || {}) as SiteSettings;

  return (
    <>
      <SiteHeaderSolid
        siteTitle={site.siteTitle}
        brandName={site.brandName}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter siteTitle={site.siteTitle} brandName={site.brandName} />
    </>
  );
}
