import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_ITEMS } from "../src/content/index";
import { weeklyDigest } from "../src/lib/digest";

// Writes the weekly digest one-pager to DIGEST.md at the repo root. Run by
// the ingestion agent (see agent/INGEST.md) so a forwardable "what moved"
// summary is committed alongside the feed; also runnable by hand:
//   npm --prefix web run digest
const out = resolve(import.meta.dirname, "../../DIGEST.md");
writeFileSync(out, weeklyDigest(ALL_ITEMS) + "\n", "utf8");
console.log(`Wrote ${out}`);
