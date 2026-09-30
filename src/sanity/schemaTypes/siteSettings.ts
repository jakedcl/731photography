import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      initialValue: "Thomas Lurker",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brandName",
      title: "Brand name",
      type: "string",
      description: "Shown as the business / shop mark.",
      initialValue: "731photography",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "One short line under the name on the homepage.",
    }),
    defineField({
      name: "about",
      title: "About",
      type: "text",
      rows: 6,
      description: "Short bio for the About section.",
    }),
    defineField({
      name: "inquiryEmail",
      title: "Event inquiry email",
      type: "string",
      description:
        "Where Book an event form submissions are sent (via Resend).",
      validation: (rule) => rule.required().email(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site settings" };
    },
  },
});
