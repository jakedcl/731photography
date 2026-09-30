import { defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons/Image";

import { PrintShapeInput } from "@/sanity/components/PrintShapeInput";

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the URL. Click Generate after you set the title.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Upload the full-res photo as shot. Set the hotspot so the important part stays in the print crop. Print shape (below) fills in from the image size — you can still change it.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Short description for accessibility and SEO.",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 3,
      description: "Optional short story under the photo.",
    }),
    defineField({
      name: "printShape",
      title: "Print shape",
      type: "string",
      description:
        "Auto-set from the photo’s width÷height when you upload (or replace) the image. Portrait → 8×10 / 11×14 / 16×20. Landscape → 10×8 / 14×11 / 20×16. Panoramic (≥1.75:1) → 16×8 / 20×10 / 24×12. Change the radio anytime.",
      options: {
        list: [
          { title: "Portrait (taller)", value: "portrait" },
          { title: "Landscape (wider)", value: "landscape" },
          { title: "Panoramic (very wide)", value: "panoramic" },
        ],
        layout: "radio",
      },
      components: { input: PrintShapeInput },
      validation: (rule) =>
        rule.custom((value, context) => {
          const forSale = (context.document as { forSale?: boolean } | undefined)
            ?.forSale;
          if (forSale === false) return true;
          if (!value) {
            return "Upload an image so we can detect print shape, or pick one here.";
          }
          return true;
        }).warning(),
    }),
    defineField({
      name: "forSale",
      title: "For sale",
      type: "boolean",
      description: "Turn off to show in the gallery without a buy button.",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Can appear as a homepage highlight.",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      description: "Lower numbers show first. Leave blank to sort by newest.",
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [
        { field: "sortOrder", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      forSale: "forSale",
      featured: "featured",
      printShape: "printShape",
    },
    prepare({ title, media, forSale, featured, printShape }) {
      const bits = [
        forSale === false ? "Not for sale" : "For sale",
        printShape || null,
        featured ? "Featured" : null,
      ].filter(Boolean);
      return {
        title: title || "Untitled photo",
        subtitle: bits.join(" · "),
        media,
      };
    },
  },
});
