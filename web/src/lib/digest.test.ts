import { describe, it, expect } from "vitest";
import { weeklyDigest } from "./digest";
import type { CoverageEntry, Item } from "../content/types";

const now = new Date("2026-06-07T00:00:00");

const fresh: Item = {
  id: "f1",
  regime: "EU",
  category: "regulatory-update",
  title: "EU adds a new restrictive-measures annex",
  summary: "Something happened.",
  whyItMatters: "Bank lens here.",
  date: "2026-06-05",
  addedAt: "2026-06-05",
  addedBy: "agent",
  status: "published",
  programme: "Russia",
  verified: true,
  tags: ["russia"],
  sources: [{ name: "EUR-Lex", url: "https://eur-lex.europa.eu/", kind: "primary" }],
};

const stale: Item = {
  id: "s1",
  regime: "UK",
  category: "action",
  title: "Old news from January",
  summary: "Ancient.",
  date: "2026-01-01",
  addedAt: "2026-01-01",
  addedBy: "agent",
  status: "published",
  tags: ["x"],
  sources: [{ name: "Wire" }],
};

describe("weeklyDigest", () => {
  it("summarises the last 7 days with sections, the bank lens and a source", () => {
    const md = weeklyDigest([fresh, stale], now);
    expect(md).toContain("# Horizon weekly digest");
    expect(md).toContain("1 new item in the last 7 days");
    expect(md).toContain("## What moved");
    expect(md).toContain("**EU**: 1 new item");
    expect(md).toContain("## Notable this week");
    expect(md).toContain("### EU adds a new restrictive-measures annex");
    expect(md).toContain("> **Why this matters:** Bank lens here.");
    expect(md).toContain("✓ Verified");
    expect(md).toContain("[EUR-Lex](https://eur-lex.europa.eu/)");
    expect(md).not.toContain("Old news from January"); // outside the 7-day window
    expect(md).toContain("1 new · 0 sanctions actions · 1 verified");
  });

  it("handles a quiet week", () => {
    expect(weeklyDigest([stale], now)).toContain("No new items surfaced this week.");
  });

  it("names sources that were not fully checked, even in a quiet week", () => {
    const coverage: CoverageEntry[] = [
      { sourceId: "uk-sanctions-list", name: "UK Sanctions List", regime: "UK", checkedAt: "2026-06-06", status: "checked" },
      { sourceId: "eu-council", name: "Council of the EU sanctions pages", regime: "EU", checkedAt: "2026-06-06", status: "unreachable", note: "403" },
    ];
    const md = weeklyDigest([stale], now, coverage);
    expect(md).toContain("**Not fully checked this run:** Council of the EU sanctions pages (unreachable, 6 June 2026).");
    expect(md).toContain("No new items surfaced this week.");
  });

  it("states full coverage when every source was checked", () => {
    const coverage: CoverageEntry[] = [
      { sourceId: "uk-sanctions-list", name: "UK Sanctions List", regime: "UK", checkedAt: "2026-06-06", status: "checked" },
    ];
    expect(weeklyDigest([fresh], now, coverage)).toContain("**Coverage:** all 1 source checked.");
  });
});
