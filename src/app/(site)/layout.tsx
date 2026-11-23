import { SiteFooter, SiteHeaderSolid } from "@/components/SiteChrome";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { emptySiteSettings } from "@/sanity/lib/types";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: settings } = await sanityFetch({
    query: SITE_SETTINGS_QUERY,
  });

  const site = settings ?? emptySiteSettings;

  return (
    <>
      <SiteHeaderSolid
        siteTitle={site.siteTitle ?? undefined}
        brandName={site.brandName ?? undefined}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter
        siteTitle={site.siteTitle ?? undefined}
        brandName={site.brandName ?? undefined}
      />
    </>
  );
}
