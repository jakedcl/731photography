import Link from "next/link";

const links = [
  { href: "/prints", label: "Prints" },
  { href: "/book", label: "Book an event", shortLabel: "Book" },
] as const;

function NavLabel({
  link,
}: {
  link: (typeof links)[number];
}) {
  if (!("shortLabel" in link) || !link.shortLabel) return link.label;
  return (
    <>
      {link.shortLabel}
      <span className="hidden sm:inline">
        {link.label.slice(link.shortLabel.length)}
      </span>
    </>
  );
}

type HeaderProps = {
  siteTitle?: string;
  brandName?: string;
  /** overlay = on dark hero photo; solid = paper pages */
  variant?: "overlay" | "solid";
};

export function SiteHeader({
  siteTitle = "Thomas Lurker",
  brandName = "731photography",
  variant = "overlay",
}: HeaderProps) {
  const overlay = variant === "overlay";

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-20"
          : "border-b border-stone-200/80 bg-[var(--paper)]"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 md:px-8">
        <Link href="/" className="group min-w-0">
          <span
            className={`block truncate text-[11px] font-medium uppercase tracking-[0.22em] transition ${
              overlay
                ? "text-white/75 group-hover:text-white"
                : "text-stone-500 group-hover:text-stone-800"
            }`}
          >
            {brandName}
          </span>
          <span
            className={`mt-1 block truncate text-lg font-semibold tracking-tight md:text-xl ${
              overlay ? "text-white" : "text-stone-900"
            }`}
          >
            {siteTitle}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-5 sm:gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-medium uppercase tracking-[0.18em] transition ${
                overlay
                  ? "text-white/70 hover:text-white"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <NavLabel link={link} />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/** Same as `<SiteHeader variant="solid" />` — kept for readable call sites. */
export function SiteHeaderSolid(props: Omit<HeaderProps, "variant">) {
  return <SiteHeader {...props} variant="solid" />;
}

export function SiteFooter({
  brandName = "731photography",
  siteTitle = "Thomas Lurker",
}: {
  brandName?: string;
  siteTitle?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-stone-200/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:px-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800">{siteTitle}</p>
            <p className="mt-1 text-sm text-stone-500">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
              Fine art prints and event photography.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-stone-800">Explore</p>
              <Link href="/prints" className="text-stone-500 hover:text-stone-800">
                Prints
              </Link>
              <Link href="/about" className="text-stone-500 hover:text-stone-800">
                About
              </Link>
              <Link href="/book" className="text-stone-500 hover:text-stone-800">
                Book an event
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-stone-800">Orders</p>
              <Link
                href="/shipping"
                className="text-stone-500 hover:text-stone-800"
              >
                Shipping & returns
              </Link>
              <Link
                href="/contact"
                className="text-stone-500 hover:text-stone-800"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-stone-500 hover:text-stone-800"
              >
                Privacy
              </Link>
              <Link href="/terms" className="text-stone-500 hover:text-stone-800">
                Terms
              </Link>
            </div>
          </div>
        </div>
        <p className="text-xs text-stone-400">
          © {year} {siteTitle}. All photographs remain copyright of the artist.
        </p>
      </div>
    </footer>
  );
}
