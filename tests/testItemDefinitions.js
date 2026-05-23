import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { normalizeItemDefinitions } from "../src/gameplay/itemRegistry.js";

export const TEST_ITEM_DEFINITIONS = normalizeItemDefinitions(
  JSON.parse(readFileSync(resolve("assets/data/items.json"), "utf8")),
);
