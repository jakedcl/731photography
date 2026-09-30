import type { SchemaTypeDefinition } from "sanity";

import { photo } from "./photo";
import { printSizes } from "./printSizes";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  photo,
  printSizes,
  siteSettings,
];
