import { defineArrayMember, defineField, defineType } from "sanity";
import { StackCompactIcon } from "@sanity/icons/StackCompact";

export const printSizes = defineType({
  name: "printSizes",
  title: "Print sizes & prices",
  type: "document",
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      description:
        "Prices by size sku. Portrait uses 8x10 / 11x14 / 16x20. Landscape reuses those prices (10×8 → 8x10, etc.). Add panoramic rows: 16x8 / 20x10 / 24x12. Prodigi codes live in code defaults unless you override.",
      of: [
        defineArrayMember({
          type: "object",
          name: "printSize",
          fields: [
            defineField({
              name: "label",
              title: "Size label",
              type: "string",
              description: 'e.g. "8×10" or "16×8"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "sku",
              title: "SKU",
              type: "slug",
              description:
                "Must match catalog: 8x10, 11x14, 16x20, 16x8, 20x10, 24x12.",
              options: { maxLength: 32 },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "priceCents",
              title: "Price (cents)",
              type: "number",
              description: "Store as cents — 3500 = $35.00",
              validation: (rule) => rule.required().integer().positive(),
            }),
            defineField({
              name: "prodigiSku",
              title: "Prodigi SKU override",
              type: "string",
              description:
                "Optional. Leave blank — defaults are mapped in code (matte + lustre). Only set if you need a one-off.",
            }),
            defineField({
              name: "active",
              title: "Active",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              label: "label",
              priceCents: "priceCents",
              active: "active",
            },
            prepare({ label, priceCents, active }) {
              const dollars =
                typeof priceCents === "number"
                  ? `$${(priceCents / 100).toFixed(2)}`
                  : "No price";
              return {
                title: label || "Size",
                subtitle: `${dollars}${active === false ? " · Hidden" : ""}`,
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Print sizes & prices" };
    },
  },
});
