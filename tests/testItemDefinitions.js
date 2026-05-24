import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeItemDefinitions } from "../src/gameplay/itemRegistry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const TEST_ITEM_DEFINITIONS = normalizeItemDefinitions(
  JSON.parse(readFileSync(resolve(__dirname, "../assets/data/items.json"), "utf8")),
);
