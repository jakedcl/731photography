import type { StructureResolver } from "sanity/structure";
import { CogIcon } from "@sanity/icons/Cog";
import { ImageIcon } from "@sanity/icons/Image";
import { StackCompactIcon } from "@sanity/icons/StackCompact";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("731photography")
    .items([
      S.listItem()
        .title("Photos")
        .icon(ImageIcon)
        .child(
          S.documentTypeList("photo")
            .title("Photos")
            .defaultOrdering([
              { field: "sortOrder", direction: "asc" },
              { field: "title", direction: "asc" },
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Print sizes & prices")
        .icon(StackCompactIcon)
        .child(
          S.document()
            .schemaType("printSizes")
            .documentId("printSizes")
            .title("Print sizes & prices"),
        ),
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
    ]);
