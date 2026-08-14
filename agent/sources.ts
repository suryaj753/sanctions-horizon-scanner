// Fixed source registry for the Horizon ingestion agent.
//
// Exhaustive and authoritative by design, not a starting point to expand
// from (see CLAUDE.md's thesis) — exactly the UK/US/EU/UN sources named in
// the original brief, each URL live-verified (fetched, not guessed) before
// being added here. Review and update periodically; don't add other
// sources without deliberately revisiting scope.
//
// Access note: main.un.org, eur-lex.europa.eu and consilium.europa.eu all
// return a bot-check page to a plain automated fetch — the ingestion
// client needs a browser-like User-Agent (or a Trafilatura/browser-pane
// fetch, see INGEST.md) for those three domains.

import type { Regime, SourceType } from "../web/src/content/types";

export interface SourceDef {
  name: string;
  url: string;
  regime: Regime;
  sourceType: SourceType;
  /** Coarse cadence hint for the scheduler. */
  cadence: "daily" | "weekly" | "event";
  /** What to specifically extract from this source. */
  focus: string;
  /** Access caveats or discrepancies found during verification. */
  notes?: string;
}

export const SOURCES: SourceDef[] = [
  // --- UK ---
  {
    name: "UK Sanctions List",
    url: "https://www.gov.uk/government/publications/the-uk-sanctions-list",
    regime: "UK",
    sourceType: "primary-list",
    cadence: "event",
    focus: "Designations, amendments and delistings across every UK sanctions regime.",
  },
  {
    name: "Current UK sanctions regimes",
    url: "https://www.gov.uk/government/collections/uk-sanctions-regimes-under-the-sanctions-act",
    regime: "UK",
    sourceType: "legislation",
    cadence: "event",
    focus: "Regime-specific legislation, statutory guidance and notices, by country/theme.",
  },
  {
    name: "OFSI General Licences",
    url: "https://www.gov.uk/government/collections/ofsi-general-licences",
    regime: "UK",
    sourceType: "guidance",
    cadence: "event",
    focus: "New, amended, revoked and expired general licences.",
  },
  {
    name: "OFSI enforcement collection",
    url: "https://www.gov.uk/government/collections/sanctions-enforcement-action",
    regime: "UK",
    sourceType: "enforcement",
    cadence: "event",
    focus: "Enforcement decisions and monetary penalties.",
    notes: "Combines OFSI, NCA, OTSI and HMRC enforcement action, not OFSI alone.",
  },
  {
    name: "OFSI blog",
    url: "https://ofsi.blog.gov.uk/",
    regime: "UK",
    sourceType: "guidance",
    cadence: "weekly",
    focus: "Regulatory thinking, supervisory expectations, implementation guidance, lessons learned, emerging focus areas not yet in formal legislation.",
  },
  {
    name: "OTSI blog",
    url: "https://otsi.blog.gov.uk/",
    regime: "UK",
    sourceType: "guidance",
    cadence: "weekly",
    focus: "OTSI's regulatory thinking and trade-sanctions implementation guidance.",
    notes: "OFSI and OTSI run separate blogs, not a shared one — the original brief treats these as one bullet; both are listed here.",
  },
  {
    name: "UK legislation database — sanctions SIs",
    url: "https://www.legislation.gov.uk/uksi?title=sanctions",
    regime: "UK",
    sourceType: "legislation",
    cadence: "weekly",
    focus: "New sanctions regulations, amendments, statutory instruments, commencement dates, changes to prohibitions, reporting obligations, exceptions, licensing provisions.",
  },
  {
    name: "OTSI implementation",
    url: "https://www.gov.uk/government/organisations/office-of-trade-sanctions-implementation",
    regime: "UK",
    sourceType: "guidance",
    cadence: "event",
    focus: "Trade, export, transport and services restrictions.",
    notes: "No single dedicated 'implementation guidance' page exists — this org hub is the best entry point and links onward to Russia guidance, licensing and breach-reporting docs.",
  },

  // --- US ---
  {
    name: "OFAC Sanctions List Service",
    url: "https://ofac.treasury.gov/sanctions-list-service",
    regime: "US",
    sourceType: "primary-list",
    cadence: "event",
    focus: "SDN and non-SDN list data and downloads.",
  },
  {
    name: "OFAC Recent Actions",
    url: "https://ofac.treasury.gov/recent-actions",
    regime: "US",
    sourceType: "primary-list",
    cadence: "daily",
    focus: "Designations, licences, guidance and regulatory changes as they're published.",
  },
  {
    name: "OFAC Sanctions Programs and Country Information",
    url: "https://ofac.treasury.gov/sanctions-programs-and-country-information",
    regime: "US",
    sourceType: "guidance",
    cadence: "event",
    focus: "Programme-specific legal and guidance material.",
  },
  {
    name: "OFAC enforcement",
    url: "https://ofac.treasury.gov/civil-penalties-and-enforcement-information",
    regime: "US",
    sourceType: "enforcement",
    cadence: "event",
    focus: "Enforcement actions and compliance lessons.",
  },
  {
    name: "OFAC General Licences",
    url: "https://ofac.treasury.gov/recent-actions/general-licenses",
    regime: "US",
    sourceType: "guidance",
    cadence: "event",
    focus: "Exemptions, authorisations, wind-down periods, licence extensions, amendments, expiries, revocations.",
    notes: "Client-rendered route — needs JS execution or a browser-pane fetch, a plain HTTP GET will not return the list.",
  },
  {
    name: "US Treasury press releases",
    url: "https://home.treasury.gov/news/press-releases",
    regime: "US",
    sourceType: "press-political",
    cadence: "daily",
    focus: "Sanctions announcements, new designations, delistings, enforcement actions, guidance updates, FAQs, policy interpretations.",
  },
  {
    name: "White House presidential actions",
    url: "https://www.whitehouse.gov/presidential-actions/",
    regime: "US",
    sourceType: "press-political",
    cadence: "daily",
    focus: "Executive Orders, national emergency declarations, sanctions directives, foreign policy decisions that may create future sanctions authorities or expand existing programmes.",
  },

  // --- EU ---
  {
    name: "EUR-Lex — restrictive measures",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=LEGISSUM:restrictive_measures",
    regime: "EU",
    sourceType: "legislation",
    cadence: "weekly",
    focus: "Binding regulations, decisions and amendments.",
    notes: "A summary/topic entry point that links onward to individual instruments, not a live query for newest changes. Blocks plain automated fetches without a browser-like User-Agent.",
  },
  {
    name: "EU Financial Sanctions Database",
    url: "https://webgate.ec.europa.eu/fsd/fsf",
    regime: "EU",
    sourceType: "primary-list",
    cadence: "event",
    focus: "Consolidated asset-freeze designations.",
    notes: "The interactive search UI now requires an EU Login (ECAS) account; the static full-list file download works unauthenticated. Maintained by DG FISMA.",
  },
  {
    name: "European Commission sanctions pages",
    url: "https://finance.ec.europa.eu/eu-and-world/sanctions-restrictive-measures_en",
    regime: "EU",
    sourceType: "guidance",
    cadence: "event",
    focus: "Guidance, FAQs, implementation material.",
  },
  {
    name: "Council of the EU sanctions pages",
    url: "https://www.consilium.europa.eu/en/press/press-releases/",
    regime: "EU",
    sourceType: "press-political",
    cadence: "event",
    focus: "New sanctions packages, political decisions.",
    notes: "Blocks plain automated fetches behind a browser check; needs a browser-like client.",
  },
  {
    name: "Court of Justice of the European Union",
    url: "https://curia.europa.eu/juris/recherche.jsf?language=en",
    regime: "EU",
    sourceType: "legislation",
    cadence: "event",
    focus: "Judgments interpreting EU sanctions regulations, ownership/control concepts, licensing provisions, due process rights, asset freeze obligations, enforcement expectations.",
    notes: "Redirects to the InfoCuria case-law search tool (infocuria.curia.europa.eu).",
  },

  // --- UN ---
  {
    name: "UN Consolidated List",
    url: "https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list",
    regime: "UN",
    sourceType: "primary-list",
    cadence: "event",
    focus: "All current UN designations.",
  },
  {
    name: "UN list-update log",
    url: "https://main.un.org/securitycouncil/en/content/list-updates-unsc-consolidated-list",
    regime: "UN",
    sourceType: "primary-list",
    cadence: "event",
    focus: "Listings, amendments and delistings.",
  },
  {
    name: "UN Sanctions Committees",
    url: "https://main.un.org/securitycouncil/en/sanctions/information",
    regime: "UN",
    sourceType: "guidance",
    cadence: "event",
    focus: "Regime-specific measures, guidance and notices.",
  },
  {
    name: "UN Security Council resolutions",
    url: "https://main.un.org/securitycouncil/en/content/resolutions-0",
    regime: "UN",
    sourceType: "legislation",
    cadence: "event",
    focus: "Resolutions creating or amending sanctions regimes or monitoring/reporting requirements.",
  },
];
