"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "731photography",
  title: "731photography",
  basePath: "/admin",
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
  // Floating "What's new" card (bottom-left) and the announcement dialog.
  announcements: { enabled: false },
});
