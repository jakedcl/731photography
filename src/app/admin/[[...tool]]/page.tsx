import type { Viewport } from "next";
import { NextStudio, metadata, viewport as studioViewport } from "next-sanity/studio";

import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata };

export const viewport: Viewport = {
  ...studioViewport,
  // Shrink the layout when the keyboard opens so the focused field stays visible.
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
