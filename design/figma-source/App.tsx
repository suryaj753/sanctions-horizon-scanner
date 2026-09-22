import { useState, useEffect } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
type StageId = 0 | 1 | 2 | 3
type Urgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
type Priority = 'IMMEDIATE' | 'URGENT' | 'ROUTINE'
type SourceType = 'API' | 'RSS_FEED' | 'WEBSITE' | 'EMAIL_ALERT'
type IngestionStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL'
type ImpactRating = 'NO_IMPACT' | 'LOW' | 'MEDIUM' | 'HIGH'
type ActionStatus = 'NO_ACTION' | 'ACTION_REQUIRED' | 'ESCALATION_REQUIRED'

interface Rec { action: string; owner: string; deadline: string; priority: Priority }
interface SourceFact { label: string; value: string }
interface InterpRow { point: string; tag: string }
interface FA {
  code: string
  rating: ImpactRating
  rationale: string
  status: ActionStatus
  actions: string[]
  owner?: string
  deadline?: string
}
interface Item {
  id: string; source: string; sourceAuthority: string; jurisdiction: string; type: string
  title: string; timestamp: string; pubDate: string; ingestionLatency: number
  originalDoc: string; sourceURL: string; entities: string[]; sectors: string[]
  urgency: Urgency; regime: string; executiveSummary: string
  sourceFacts: SourceFact[]; interpretationRows: InterpRow[]
  developments: string[]; impactScore: number; businessImpact: string[]
  recommendations: Rec[]
  frameworkAssessment: FA[]
}
interface MonitoredSource {
  name: string; type: SourceType; jurisdiction: string; url: string
  status: IngestionStatus; lastPoll: string; latencyMs: number | null
}

// ── Framework Areas ────────────────────────────────────────────────────────
const FRAMEWORK_AREAS: { code: string; name: string }[] = [
  { code: 'FA01', name: 'Sanctions Exposure Assessments' },
  { code: 'FA02', name: 'Sanctions Due Diligence' },
  { code: 'FA03', name: 'Sanctions Screening' },
  { code: 'FA04', name: 'Ongoing Screening' },
  { code: 'FA05', name: 'Payment & Transaction Screening' },
  { code: 'FA06', name: 'Calibration & Testing' },
  { code: 'FA07', name: 'Sanctions List Management' },
  { code: 'FA08', name: 'Alert Handling & Escalation' },
  { code: 'FA09', name: 'Quality Control & QA' },
  { code: 'FA10', name: 'Sanctions Breaches & Reporting' },
  { code: 'FA11', name: 'Management Information (MI)' },
  { code: 'FA12', name: 'Third-party & Outsourcing Risk' },
  { code: 'FA13', name: 'Record Keeping' },
  { code: 'FA14', name: 'People & Skills' },
  { code: 'FA15', name: 'Suitability' },
  { code: 'FA16', name: 'Training & Awareness' },
]

// ── Monitored Sources ──────────────────────────────────────────────────────
const MONITORED_SOURCES: MonitoredSource[] = [
  { name: 'OFAC SDN List', type: 'API', jurisdiction: 'US', url: 'treasury.gov/ofac/downloads/sdn.xml', status: 'SUCCESS', lastPoll: '2 min ago', latencyMs: 72 },
  { name: 'OFAC Non-SDN Consolidated', type: 'API', jurisdiction: 'US', url: 'treasury.gov/ofac/downloads/consolidated.xml', status: 'SUCCESS', lastPoll: '2 min ago', latencyMs: 84 },
  { name: 'OFAC Recent Actions', type: 'WEBSITE', jurisdiction: 'US', url: 'ofac.treasury.gov/recent-actions', status: 'SUCCESS', lastPoll: '6 min ago', latencyMs: 312 },
  { name: 'BIS Export Administration Regs', type: 'WEBSITE', jurisdiction: 'US', url: 'bis.doc.gov/index.php/regulations', status: 'SUCCESS', lastPoll: '14 min ago', latencyMs: 445 },
  { name: 'FinCEN Advisories', type: 'RSS_FEED', jurisdiction: 'US', url: 'fincen.gov/resources/advisories', status: 'SUCCESS', lastPoll: '8 min ago', latencyMs: 198 },
  { name: 'EU Official Journal (Sanctions)', type: 'RSS_FEED', jurisdiction: 'EU', url: 'eur-lex.europa.eu/oj/direct-access.html', status: 'SUCCESS', lastPoll: '5 min ago', latencyMs: 143 },
  { name: 'EU Sanctions Map', type: 'WEBSITE', jurisdiction: 'EU', url: 'sanctionsmap.eu', status: 'SUCCESS', lastPoll: '9 min ago', latencyMs: 201 },
  { name: 'EU Consolidated Sanctions List', type: 'API', jurisdiction: 'EU', url: 'webgate.ec.europa.eu/fsd/fsf', status: 'SUCCESS', lastPoll: '3 min ago', latencyMs: 156 },
  { name: 'UK OFSI Asset Freeze List', type: 'API', jurisdiction: 'UK', url: 'ofsistorage.blob.core.windows.net/publishlive/', status: 'SUCCESS', lastPoll: '3 min ago', latencyMs: 95 },
  { name: 'UK OFSI Website', type: 'WEBSITE', jurisdiction: 'UK', url: 'gov.uk/government/organisations/ofsi', status: 'SUCCESS', lastPoll: '11 min ago', latencyMs: 287 },
  { name: 'HMT Treasury Email Alerts', type: 'EMAIL_ALERT', jurisdiction: 'UK', url: 'public.govdelivery.com/accounts/UKHMT/', status: 'FAILED', lastPoll: '47 min ago', latencyMs: null },
  { name: 'FCDO Sanctions', type: 'WEBSITE', jurisdiction: 'UK', url: 'gov.uk/government/organisations/foreign-commonwealth-development-office', status: 'PARTIAL', lastPoll: '18 min ago', latencyMs: 534 },
  { name: 'UN SC Consolidated List', type: 'API', jurisdiction: 'MULTI', url: 'scsanctions.un.org/resources/xml/en/consolidated.xml', status: 'SUCCESS', lastPoll: '4 min ago', latencyMs: 188 },
  { name: 'FATF High-Risk Jurisdictions', type: 'WEBSITE', jurisdiction: 'MULTI', url: 'fatf-gafi.org/en/topics/high-risk-and-other-monitored-jurisdictions', status: 'SUCCESS', lastPoll: '13 min ago', latencyMs: 267 },
  { name: 'FATF RSS Feed', type: 'RSS_FEED', jurisdiction: 'MULTI', url: 'fatf-gafi.org/rss/publications', status: 'FAILED', lastPoll: '1 hr ago', latencyMs: null },
  { name: 'SECO Switzerland Sanctions', type: 'API', jurisdiction: 'CH', url: 'seco.admin.ch/sanctions', status: 'SUCCESS', lastPoll: '20 min ago', latencyMs: 341 },
  { name: 'AUSTRAC Sanctions', type: 'WEBSITE', jurisdiction: 'AU', url: 'austrac.gov.au/business/obligations/sanctions', status: 'SUCCESS', lastPoll: '22 min ago', latencyMs: 389 },
  { name: 'DFAT Australian Sanctions', type: 'API', jurisdiction: 'AU', url: 'dfat.gov.au/international-relations/security/sanctions', status: 'SUCCESS', lastPoll: '7 min ago', latencyMs: 214 },
  { name: 'World Bank Debarment List', type: 'API', jurisdiction: 'MULTI', url: 'worldbank.org/en/projects-operations/procurement/debarred-firms', status: 'SUCCESS', lastPoll: '30 min ago', latencyMs: 422 },
  { name: 'MAS Singapore Sanctions', type: 'WEBSITE', jurisdiction: 'SG', url: 'mas.gov.sg/regulation/anti-money-laundering/targeted-financial-sanctions', status: 'SUCCESS', lastPoll: '25 min ago', latencyMs: 298 },
]

// ── Alert Data ─────────────────────────────────────────────────────────────
const DATA: Item[] = [
  {
    id: 'OFAC-SDN-2024-1127',
    source: 'OFAC',
    sourceAuthority: 'Office of Foreign Assets Control — US Department of the Treasury',
    jurisdiction: 'United States',
    type: 'DESIGNATION',
    title: 'OFAC Designates 18 Entities in Iranian Petroleum Shadow Network',
    pubDate: '2024-11-27T14:32:00Z',
    timestamp: '2024-11-27T14:33:12Z',
    ingestionLatency: 72,
    originalDoc: 'SDN List Update — 27 November 2024 (Iran, IFSR, E.O. 13902)',
    sourceURL: 'ofac.treasury.gov/recent-actions/20241127',
    entities: ['Sepahan Oil Co.', 'NICO International Ltd', 'Persian Gulf Petrochem.', 'Samah Shipping LLC', 'Kaveh Moon Trading'],
    sectors: ['Energy', 'Shipping', 'Finance', 'Trading'],
    urgency: 'CRITICAL',
    regime: 'Iranian Transactions & Sanctions Regulations (ITSR) / E.O. 13902',
    executiveSummary: 'OFAC has expanded its Iran-related SDN designations, adding 18 entities operating within a shadow petroleum export network. Three entities are potential matches against active counterparty relationships. Immediate rescreening of all correspondent accounts and payment flows is required to avoid strict liability exposure.',
    sourceFacts: [
      { label: 'Number of new designations', value: '18 entities added to the SDN list' },
      { label: 'Designation authorities', value: 'Iran Sanctions Act (ISA) and Executive Order 13902' },
      { label: 'OFAC programs invoked', value: 'IRAN, IFSR (Iranian Financial Sanctions Regulations)' },
      { label: 'Primary target activity', value: 'Petroleum export logistics and intermediary services' },
      { label: 'Vessels designated', value: '7 vessels classified as blocked property under OFAC jurisdiction' },
      { label: 'Transit jurisdictions named', value: 'United Arab Emirates, Malaysia, Hong Kong' },
      { label: 'Effective date', value: '27 November 2024' },
      { label: 'List type', value: 'Specially Designated Nationals and Blocked Persons (SDN)' },
      { label: 'Secondary sanctions risk', value: 'Elevated for non-US persons under ISA Section 5(a)' },
    ],
    interpretationRows: [
      { point: 'The UAE / Malaysia / Hong Kong intermediary pattern reflects a documented OFAC evasion typology. Non-US financial institutions processing related transactions face secondary sanctions exposure regardless of whether USD is involved — the nexus test for secondary sanctions is activity-based, not currency-based.', tag: 'SANCTIONS TYPOLOGY' },
      { point: 'Three potential name matches against active correspondent accounts represent acute strict-liability risk. Under OFAC\'s strict liability standard, a sanctions violation can occur without knowledge or intent. Civil penalty exposure can reach the greater of $356,579 or twice the transaction value.', tag: 'LEGAL RISK' },
      { point: 'Designation of 7 vessels as blocked property means any port services, insurance, P&I cover, or trade finance referencing these vessels — regardless of cargo — is prohibited. This extends to vessel name changes, which OFAC tracks via IMO numbers.', tag: 'OPERATIONAL IMPACT' },
      { point: 'The dual ISA and E.O. 13902 designation authority signals OFAC is pursuing maximum enforcement leverage. ISA designations can trigger Correspondent Account Sanctions (CAPTA) against foreign banks that facilitate transactions for designated entities.', tag: 'ENFORCEMENT SIGNAL' },
    ],
    developments: [
      'New SDN designations under ISA and E.O. 13902 targeting petrochemical intermediaries',
      'Shadow fleet operators added — 7 vessels now blocked property under OFAC jurisdiction',
      'UAE, Malaysia and Hong Kong flagged as primary transit jurisdictions for evasion activity',
      'Secondary sanctions risk elevated for non-US entities processing Iran-related transactions',
    ],
    impactScore: 93,
    businessImpact: [
      'Potential SDN match identified on 3 active correspondent accounts — immediate rescreening required',
      'Shipping clients using shadow fleet vessel operators face direct OFAC SDN exposure',
      'Trade finance facilities linked to UAE ports require urgent due diligence re-review',
      'Any USD-clearing activity involving designated entities constitutes strict liability violation',
    ],
    recommendations: [
      { action: 'Immediate full-portfolio rescreening against updated SDN list — halt processing on any matches', owner: 'Screening Operations', deadline: '2024-11-27', priority: 'IMMEDIATE' },
      { action: 'Suspend USD clearing for 3 flagged correspondent accounts pending sanctions review', owner: 'Payments Operations', deadline: '2024-11-27', priority: 'IMMEDIATE' },
      { action: 'Notify Relationship Managers for affected counterparties within 4 hours of this alert', owner: 'Sanctions Advisory', deadline: '2024-11-27', priority: 'URGENT' },
      { action: 'File precautionary SAR with FinCEN re: potentially blocked transactions', owner: 'Financial Intelligence', deadline: '2024-12-04', priority: 'URGENT' },
    ],
    frameworkAssessment: [
      { code: 'FA01', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Enterprise-wide exposure requires immediate re-assessment across petroleum, shipping, and UAE/Malaysia/HK-connected activities. Three active counterparty matches elevate risk to critical threshold.', actions: ['Commission emergency exposure assessment across all petroleum sector and affected jurisdiction portfolios', 'Update enterprise sanctions risk register with elevated ITSR exposure rating'], owner: 'Head of Sanctions', deadline: '2024-11-28' },
      { code: 'FA02', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Three active counterparties are potential SDN matches. Existing CDD files require immediate refresh against new designation context.', actions: ['Freeze account actions for 3 flagged counterparties pending CDD refresh', 'Conduct EDD review incorporating new SDN entity context; submit findings to Sanctions Advisory within 24 hours'], owner: 'Sanctions Due Diligence', deadline: '2024-11-28' },
      { code: 'FA03', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Updated SDN list must be ingested immediately. All 18 new designations and 7 vessel additions must be validated in screening systems before further processing.', actions: ['Confirm SDN list update ingested across all screening environments within 2 hours', 'Run name variant analysis for all 18 new designations against existing customer and counterparty base'], owner: 'Screening Operations', deadline: '2024-11-27' },
      { code: 'FA04', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Event-driven rescreening must be triggered immediately for all counterparties with petroleum, shipping, and UAE/Malaysia/HK exposure.', actions: ['Trigger immediate rescreening for all petroleum sector and shipping clients', 'Run targeted rescreening for all UAE, Malaysia, and Hong Kong correspondent relationships'], owner: 'Screening Operations', deadline: '2024-11-27' },
      { code: 'FA05', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'All pending payment queues involving new SDN entities must be halted. Seven newly designated vessel names must be added to payment screening filters.', actions: ['Halt processing of all PFT transactions pending re-screening against updated SDN list', 'Add 7 newly designated vessel names and IMO numbers to payment screening watch lists immediately'], owner: 'Payments Operations', deadline: '2024-11-27' },
      { code: 'FA06', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Screening thresholds may require recalibration to detect UAE/Malaysia/HK intermediary name variants and shadow fleet evasion patterns.', actions: ['Review fuzzy matching thresholds for intermediary names in designated jurisdictions', 'Test screening coverage against known alias and variant patterns for newly designated entities'], owner: 'Screening Technology', deadline: '2024-12-04' },
      { code: 'FA07', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'OFAC SDN list has been updated. List management processes must confirm successful ingestion and record count validation before screening can be certified.', actions: ['Confirm SDN list version update timestamp and record count match OFAC published values', 'Validate all 18 new designations correctly loaded across all environments and record in list management log'], owner: 'Sanctions List Management', deadline: '2024-11-27' },
      { code: 'FA08', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Potential matches on 3 active counterparties require immediate escalation to Level 3 investigation and notification of senior sanctions management.', actions: ['Open urgent case files for 3 potential counterparty matches and escalate to Level 3 investigation immediately', 'Notify Head of Sanctions and Group Legal within 4 hours; suspend account activity pending investigation'], owner: 'Sanctions Investigations', deadline: '2024-11-27' },
      { code: 'FA09', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Given critical urgency, independent QA review of all match investigation decisions is required before any accounts are cleared or blocked.', actions: ['Conduct independent QA review of all alerts and dispositions arising from this SDN update', 'Report QA findings to Sanctions Governance Committee within 10 business days'], owner: 'Quality Assurance', deadline: '2024-12-06' },
      { code: 'FA10', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Transactions processed between OFAC publication time and list ingestion time may constitute unlicensed transactions. Precautionary SAR filing required.', actions: ['Assess all transactions processed in the 72-second window between OFAC publication and list ingestion for potential violation', 'File precautionary SAR with FinCEN for any transactions involving potential SDN matches; notify MLRO immediately'], owner: 'Financial Intelligence Unit', deadline: '2024-12-04' },
      { code: 'FA11', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Senior management and board must be informed of critical designation update and potential counterparty exposure via same-day briefing.', actions: ['Issue same-day management briefing to MLRO, CRO, and Sanctions Steering Committee', 'Update daily sanctions MI dashboard to reflect new designations and include in next board risk committee pack'], owner: 'Sanctions Advisory', deadline: '2024-11-27' },
      { code: 'FA12', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Third-party vendors with UAE port, Malaysian trade corridor, or shadow fleet exposure require immediate sanctions risk re-assessment.', actions: ['Identify all third-party vendors with UAE/Malaysia/HK or petroleum sector nexus and issue urgent risk questionnaire', 'Suspend third-party payment instructions involving flagged entities pending re-assessment'], owner: 'Third-party Risk', deadline: '2024-12-04' },
      { code: 'FA13', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'All screening decisions, investigations, account freezes, and escalation actions must be documented with precise timestamps for regulatory audit trail.', actions: ['Document all screening alerts, investigation steps, and disposition decisions with timestamps in case management system', 'Retain all communications related to counterparty match investigations under document hold policy'], owner: 'Sanctions Operations', deadline: '2024-11-27' },
      { code: 'FA14', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Sanctions investigators require awareness of shadow fleet evasion typology and ITSR secondary sanctions risk to conduct effective reviews.', actions: ['Issue sanctions advisory memo to all screening and investigations staff covering shadow fleet typology and ITSR secondary sanctions', 'Arrange targeted briefing for L2/L3 investigators on ITSR implications within 5 business days'], owner: 'Sanctions Learning', deadline: '2024-12-04' },
      { code: 'FA15', rating: 'LOW', status: 'NO_ACTION', rationale: 'No change to individual competency requirements. Existing role-based suitability assessments remain adequate for this designation type.', actions: [] },
      { code: 'FA16', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Broader staff awareness of Iranian petroleum sanctions evasion, shadow fleet structures, and UAE/Malaysia/HK red flags should be incorporated into the next training cycle.', actions: ['Schedule targeted awareness session on Iranian petroleum sanctions evasion typologies for trade finance and correspondent banking teams', 'Update sanctions training materials to include shadow fleet case study and record completion in LMS'], owner: 'Sanctions Learning', deadline: '2024-12-18' },
    ],
  },
  {
    id: 'EU-REG-2024-1358',
    source: 'EU Council',
    sourceAuthority: 'Council of the European Union — General Secretariat',
    jurisdiction: 'European Union',
    type: 'REGULATION',
    title: 'Council Regulation (EU) 2024/1358 — 14th Package Belarus Sanctions',
    pubDate: '2024-11-25T09:00:00Z',
    timestamp: '2024-11-25T09:02:23Z',
    ingestionLatency: 143,
    originalDoc: 'Council Regulation (EU) 2024/1358 of 25 November 2024',
    sourceURL: 'eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1358',
    entities: ['Belneftekhim State Concern', 'JSC Belaruskali', 'Air Lines of Belarus', 'Belarusian Railways', 'BPS-Sberbank'],
    sectors: ['Potash', 'Aviation', 'Rail', 'Finance', 'Logistics'],
    urgency: 'HIGH',
    regime: 'EU Regulation 765/2006 on Restrictive Measures in Respect of Belarus',
    executiveSummary: 'The EU\'s 14th Belarus sanctions package introduces a new anti-circumvention clause for CIS transit routes and adds five entity designations including aviation and rail operators. EU-incorporated entities face mandatory quarterly reporting from 1 January 2025.',
    sourceFacts: [
      { label: 'Regulation identifier', value: 'Council Regulation (EU) 2024/1358' },
      { label: 'Package number', value: '14th Belarus sanctions package' },
      { label: 'Number of new designations', value: '5 entities added to the asset freeze list' },
      { label: 'New legal provision', value: 'Anti-circumvention clause (Article 9a) — first inclusion in Belarus regime' },
      { label: 'Covered transit jurisdictions', value: 'Georgia, Republic of Kazakhstan, Republic of Armenia' },
      { label: 'Prohibited goods category', value: 'Belarusian-origin potash exports transiting third countries' },
      { label: 'Financial institution designated', value: 'BPS-Sberbank and its subsidiaries' },
      { label: 'Reporting obligation effective', value: '1 January 2025 — mandatory quarterly reporting for EU-incorporated entities' },
      { label: 'Sectors newly covered', value: 'Aviation (Air Lines of Belarus), rail transport (Belarusian Railways)' },
    ],
    interpretationRows: [
      { point: 'The anti-circumvention clause for CIS transit hubs closes a known and actively exploited loophole. Belarusian potash was being re-routed through Georgian and Kazakh intermediaries. Institutions financing these flows must now conduct EDD even where the counterparty is incorporated outside Belarus.', tag: 'CIRCUMVENTION RISK' },
      { point: 'The BPS-Sberbank designation prohibits financial services — a broader concept than asset freeze that can capture correspondent clearing, trade finance, and FX settlements even where no funds are transferred to Sberbank directly.', tag: 'FINANCIAL SERVICES' },
      { point: 'Mandatory quarterly reporting from 1 January 2025 creates a new positive compliance obligation for EU-incorporated entities. Non-compliance constitutes a regulatory breach under Regulation 765/2006 and may attract fines from national competent authorities.', tag: 'REGULATORY OBLIGATION' },
      { point: 'Aviation and rail designations will create second-order impacts for logistics clients with Eastern or Central European supply chain exposure. Aircraft wet leases, ground handling agreements, and intermodal rail contracts touching these operators may require unwinding.', tag: 'SUPPLY CHAIN' },
    ],
    developments: [
      'Anti-circumvention clause now covers CIS transit hubs (Georgia, Kazakhstan, Armenia)',
      '5 new entity designations including aviation and rail operators',
      'Financial services prohibition extended to BPS-Sberbank subsidiaries',
      'Enhanced reporting obligations for EU-established entities effective 1 January 2025',
    ],
    impactScore: 74,
    businessImpact: [
      'Trade finance for potash exports via Central Asian routes now requires mandatory EDD',
      'Aviation finance clients must demonstrate no indirect exposure to Air Lines of Belarus',
      'Correspondent relationships with CIS transit banks require circumvention risk assessment',
      'EU-based subsidiaries face new quarterly reporting obligations from January 2025',
    ],
    recommendations: [
      { action: 'Update screening parameters to flag Belarus-origin goods transiting via CIS intermediaries', owner: 'Screening Operations', deadline: '2024-12-02', priority: 'URGENT' },
      { action: 'Issue EDD questionnaire to potash sector and CIS logistics client segments', owner: 'Trade Finance', deadline: '2024-12-09', priority: 'URGENT' },
      { action: 'Brief EU subsidiary compliance officers on new Article 9a reporting obligations', owner: 'Group Compliance', deadline: '2024-12-16', priority: 'ROUTINE' },
    ],
    frameworkAssessment: [
      { code: 'FA01', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'CIS transit route exposure must be re-assessed across trade finance, potash, and logistics portfolios. Anti-circumvention provisions significantly expand the scope of Belarus-related risk.', actions: ['Commission exposure re-assessment covering all CIS-transiting trade finance and potash sector activities', 'Update jurisdiction risk matrix to flag Georgia, Kazakhstan, and Armenia as elevated-risk for Belarus-linked goods'], owner: 'Head of Sanctions', deadline: '2024-12-02' },
      { code: 'FA02', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'EDD is now required for potash exporters and logistics clients using CIS transit routes. Existing onboarding files for affected clients are insufficient under the new anti-circumvention provisions.', actions: ['Issue EDD questionnaire to all potash sector and CIS logistics clients within 10 business days', 'Review onboarding files for BPS-Sberbank-connected counterparties and update risk ratings'], owner: 'Trade Finance Due Diligence', deadline: '2024-12-09' },
      { code: 'FA03', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Five new EU designations including BPS-Sberbank must be ingested and validated across all screening systems. Aviation and rail operator names require watch list addition.', actions: ['Confirm 5 new EU designations are correctly ingested and validated in all screening environments', 'Add Air Lines of Belarus and Belarusian Railways to sector-specific watch lists for aviation and logistics screening'], owner: 'Screening Operations', deadline: '2024-11-27' },
      { code: 'FA04', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Periodic rescreening for CIS-connected correspondent and trade finance counterparties should be triggered as an event-driven response to the anti-circumvention designation.', actions: ['Trigger event-driven rescreening for all CIS-connected correspondent banking relationships', 'Schedule targeted rescreening for potash sector clients within 15 business days'], owner: 'Screening Operations', deadline: '2024-12-09' },
      { code: 'FA05', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Payment screening rules must be updated to detect transactions involving CIS transit jurisdictions and newly designated entities before processing.', actions: ['Update payment screening rules to flag transactions involving CIS intermediary jurisdictions for enhanced review', 'Add BPS-Sberbank SWIFT BIC and correspondent account identifiers to payment watch lists'], owner: 'Payments Compliance', deadline: '2024-12-02' },
      { code: 'FA06', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Screening calibration must incorporate anti-circumvention logic — detecting indirect Belarus exposure via CIS transit is a new detection requirement not currently covered.', actions: ['Review and update screening rules to detect Belarusian-origin goods transiting CIS jurisdictions', 'Test anti-circumvention detection coverage against known transit route patterns before go-live'], owner: 'Screening Technology', deadline: '2024-12-09' },
      { code: 'FA07', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'EU consolidated sanctions list update containing 5 new designations must be ingested, validated, and version-controlled across all environments.', actions: ['Confirm EU consolidated list update ingested and 5 new designations correctly loaded', 'Update list management log with ingestion confirmation, version number, and validation sign-off'], owner: 'Sanctions List Management', deadline: '2024-11-26' },
      { code: 'FA08', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'New designation alerts arising from the BPS-Sberbank and aviation/rail entries must be triaged and investigated in accordance with standard investigation procedures.', actions: ['Triage all screening alerts arising from 5 new designations using standard investigation workflow', 'Escalate any matches against active counterparties to senior sanctions advisory immediately'], owner: 'Sanctions Investigations', deadline: '2024-12-02' },
      { code: 'FA09', rating: 'LOW', status: 'NO_ACTION', rationale: 'No immediate QA uplift required. Existing QA processes are adequate for the designation volume and alert complexity presented by this package.', actions: [] },
      { code: 'FA10', rating: 'LOW', status: 'NO_ACTION', rationale: 'No immediate breach risk identified. Regulation is prospective in effect and does not create retrospective liability for existing transactions.', actions: [] },
      { code: 'FA11', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'EU subsidiary reporting obligations from January 2025 require MI framework updates to track and report quarterly under Article 9a.', actions: ['Update MI reporting framework to incorporate EU subsidiary quarterly reporting obligation from 1 January 2025', 'Issue compliance calendar reminder to EU subsidiary heads with Article 9a reporting deadlines'], owner: 'Sanctions MI', deadline: '2024-12-16' },
      { code: 'FA12', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Third-party vendors, agents, and intermediaries with CIS transit or potash sector exposure face elevated circumvention risk under the new anti-circumvention clause.', actions: ['Identify all third-party vendors with CIS transit or potash sector exposure and issue circumvention risk questionnaire', 'Review and update third-party sanctions clauses to reflect anti-circumvention provisions'], owner: 'Third-party Risk', deadline: '2024-12-09' },
      { code: 'FA13', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Documentation of EDD decisions for CIS-transit clients and quarterly reporting records must be maintained under Article 9a audit requirements.', actions: ['Implement documentation protocol for CIS-transit EDD decisions referencing Article 9a', 'Establish quarterly reporting record-keeping process for EU subsidiaries from 1 January 2025'], owner: 'Sanctions Operations', deadline: '2024-12-16' },
      { code: 'FA14', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Trade finance and correspondent banking staff require awareness of anti-circumvention provisions and the CIS transit red flag typology.', actions: ['Issue advisory memo on anti-circumvention provisions to trade finance and correspondent banking teams', 'Identify knowledge gaps and arrange targeted briefings on Belarus circumvention typologies within 15 business days'], owner: 'Sanctions Learning', deadline: '2024-12-09' },
      { code: 'FA15', rating: 'LOW', status: 'NO_ACTION', rationale: 'No change to individual suitability requirements. Existing competency frameworks remain adequate for the nature and complexity of this regulatory change.', actions: [] },
      { code: 'FA16', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Anti-circumvention training is required for trade finance, correspondent banking, and EU subsidiary compliance staff to ensure understanding of new obligations.', actions: ['Deliver anti-circumvention awareness session for trade finance and correspondent banking teams by end of December 2024', 'Update sanctions training materials to incorporate Belarus 14th package anti-circumvention provisions'], owner: 'Sanctions Learning', deadline: '2024-12-20' },
    ],
  },
  {
    id: 'UNSC-RES-2758-2024',
    source: 'UN Security Council',
    sourceAuthority: 'United Nations Security Council — Sanctions Committee',
    jurisdiction: 'Multilateral',
    type: 'RESOLUTION',
    title: 'UNSC Resolution 2758 — DPRK Embargo Extension & Dual-Use Provisions',
    pubDate: '2024-11-22T16:00:00Z',
    timestamp: '2024-11-22T16:03:08Z',
    ingestionLatency: 188,
    originalDoc: 'S/RES/2758 (2024) — Security Council Resolution',
    sourceURL: 'scsanctions.un.org/resources/xml/en/consolidated.xml',
    entities: ['Korea Mining Dev. Corp (KOMID)', 'Reconnaissance General Bureau', 'Glocom Platform Ltd', 'Green Pine Assoc. Corp.'],
    sectors: ['Defence', 'Technology', 'Mining', 'Finance'],
    urgency: 'HIGH',
    regime: 'UNSC Consolidated Sanctions List / Chapter VII UN Charter',
    executiveSummary: 'The UN Security Council has extended the DPRK arms embargo through 2026 with no sunset clause and introduced dual-use semiconductor provisions. New designations cover the Russia-DPRK munitions channel including PMC-adjacent entities for the first time.',
    sourceFacts: [
      { label: 'Resolution number', value: 'S/RES/2758 (2024)' },
      { label: 'Embargo extended to', value: '31 December 2026' },
      { label: 'Sunset clause', value: 'None — no automatic expiry provision included' },
      { label: 'New dual-use provisions', value: 'Semiconductors, precision components, and related technology transfers' },
      { label: 'New designation category', value: 'Entities supplying munitions via Russia-DPRK channel' },
      { label: 'PMC coverage', value: 'PMC-adjacent entities now explicitly included for the first time' },
      { label: 'Panel of Experts', value: 'Mandate renewed with expanded member-state reporting requirements' },
      { label: 'UN Committee pre-clearance', value: 'Required for dual-use technology exports to DPRK-affiliated networks' },
    ],
    interpretationRows: [
      { point: 'The absence of a sunset clause is a deliberate signal of Security Council consensus that DPRK proliferation risk remains structurally acute. Previous resolutions carried review provisions; their removal suggests geopolitical conditions for DPRK sanctions relief are not currently viable.', tag: 'GEOPOLITICAL SIGNAL' },
      { point: 'The explicit inclusion of PMC-adjacent entities establishes a significant legal precedent. It confirms that facilitating — not directly conducting — sanctioned arms transfers is sufficient for designation, potentially lowering the threshold for financial institution exposure.', tag: 'LEGAL PRECEDENT' },
      { point: 'Dual-use semiconductor provisions capture activities previously in a regulatory grey zone. Technology clients will need to re-assess end-user certification and KYC processes against the updated Consolidated List.', tag: 'TECHNOLOGY SECTOR' },
      { point: 'The Russia-DPRK channel designation creates cross-program exposure: entities may simultaneously trigger Russia and DPRK sanctions under different jurisdictions, requiring independent legal analysis across US, EU, UK, and UN frameworks.', tag: 'CROSS-PROGRAM RISK' },
    ],
    developments: [
      'Arms embargo extended through 31 December 2026 with no sunset clause',
      'New dual-use export controls on semiconductors and precision components',
      'Russia-DPRK munitions channel designated — PMC-linked entities now explicitly covered',
      'UN Panel of Experts mandate renewed; member states required to report violations',
    ],
    impactScore: 67,
    businessImpact: [
      'Technology clients exporting dual-use components require UN Sanctions Committee pre-clearance',
      'Southeast Asia correspondent banks may facilitate DPRK procurement — typology alert issued',
      'Mining investment with Korean peninsula or Russian-DPRK corridor exposure flagged for review',
    ],
    recommendations: [
      { action: 'Audit technology sector client base against updated UNSC Consolidated List', owner: 'Screening Operations', deadline: '2024-12-05', priority: 'URGENT' },
      { action: 'Issue DPRK procurement typologies advisory to Southeast Asia correspondent network', owner: 'Correspondent Banking', deadline: '2024-12-12', priority: 'ROUTINE' },
      { action: 'Review dual-use export finance portfolio for semiconductor and precision goods exposure', owner: 'Trade Finance', deadline: '2024-12-19', priority: 'ROUTINE' },
    ],
    frameworkAssessment: [
      { code: 'FA01', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Technology sector and Southeast Asian correspondent exposure requires re-assessment. Cross-program Russia/DPRK risk significantly expands the population of potentially exposed relationships.', actions: ['Commission technology sector sanctions exposure review covering semiconductor and dual-use product supply chains', 'Map cross-program Russia/DPRK exposure across correspondent banking and trade finance portfolios'], owner: 'Head of Sanctions', deadline: '2024-12-05' },
      { code: 'FA02', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Technology sector clients involved in semiconductor or precision component exports require KYC and end-user certification review against updated UNSC Consolidated List.', actions: ['Issue EDD questionnaire to technology sector clients with dual-use export activities', 'Review end-user certificates for semiconductor and precision component export finance clients against DPRK designations'], owner: 'Trade Finance Due Diligence', deadline: '2024-12-12' },
      { code: 'FA03', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Updated UNSC Consolidated List containing 4 new designations must be ingested and validated across all screening environments immediately.', actions: ['Confirm UNSC Consolidated List update ingested and 4 new designations correctly loaded in all systems', 'Add PMC-adjacent entity names and aliases to screening watch lists with DPRK/Russia cross-program flags'], owner: 'Screening Operations', deadline: '2024-11-25' },
      { code: 'FA04', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Technology sector and Southeast Asian correspondent relationships require event-driven rescreening against the updated UNSC Consolidated List.', actions: ['Trigger targeted rescreening for all technology sector clients and Southeast Asia correspondent relationships', 'Document rescreening trigger event and outcomes for each affected counterparty'], owner: 'Screening Operations', deadline: '2024-12-05' },
      { code: 'FA05', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'DPRK procurement via Southeast Asian correspondent banks may manifest as payment flows through affected jurisdictions. Payment screening rules require updating.', actions: ['Update payment screening rules to flag transactions involving DPRK typology jurisdictions in Southeast Asia', 'Issue typology advisory to payment screening team covering DPRK procurement payment patterns'], owner: 'Payments Compliance', deadline: '2024-12-05' },
      { code: 'FA06', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Dual-use component screening requires calibration to detect semiconductor and precision parts in trade finance descriptions against DPRK control list thresholds.', actions: ['Review trade finance screening rules for dual-use semiconductor and precision component descriptions', 'Test detection coverage against UNSC control list items for technology exports to DPRK-affiliated routes'], owner: 'Screening Technology', deadline: '2024-12-12' },
      { code: 'FA07', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'UNSC Consolidated List update containing new designations must be ingested, validated, and version-controlled across all screening systems.', actions: ['Confirm UNSC list ingestion with validation of 4 new entries against published resolution text', 'Update list management log with version, ingestion timestamp, and validation sign-off'], owner: 'Sanctions List Management', deadline: '2024-11-25' },
      { code: 'FA08', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Alerts arising from new UNSC designations must be investigated with awareness of cross-program Russia/DPRK exposure risk.', actions: ['Triage new designation alerts with cross-program risk assessment noting potential simultaneous Russia/DPRK exposure', 'Escalate any technology sector or SE Asia correspondent matches immediately to senior advisory'], owner: 'Sanctions Investigations', deadline: '2024-12-05' },
      { code: 'FA09', rating: 'LOW', status: 'NO_ACTION', rationale: 'Standard QA processes are adequate. No uplift required for this designation volume.', actions: [] },
      { code: 'FA10', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Cross-program exposure risk means a potential breach against one framework may simultaneously breach another. Breach assessment must account for concurrent jurisdictional obligations.', actions: ['Update breach assessment templates to include cross-program DPRK/Russia analysis', 'Review any technology-related transactions with SE Asia nexus for potential concurrent DPRK/Russia exposure'], owner: 'Financial Intelligence Unit', deadline: '2024-12-12' },
      { code: 'FA11', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Technology sector and correspondent banking exposure to DPRK/Russia cross-program risk should be reported to senior management and the risk committee.', actions: ['Issue MI briefing on DPRK cross-program risk exposure to MLRO and CRO', 'Include technology sector UNSC exposure analysis in next monthly sanctions MI report'], owner: 'Sanctions MI', deadline: '2024-12-05' },
      { code: 'FA12', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'SE Asian correspondent banks may facilitate DPRK procurement chains. Third-party risk assessment must be extended to cover DPRK typology indicators.', actions: ['Issue DPRK procurement typology advisory to all Southeast Asia correspondent bank relationships', 'Update third-party due diligence questionnaire to include DPRK technology procurement red flags'], owner: 'Third-party Risk / Correspondent Banking', deadline: '2024-12-12' },
      { code: 'FA13', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Records of cross-program risk analysis, technology sector screening outcomes, and advisory communications must be retained for regulatory audit purposes.', actions: ['Implement cross-program risk documentation requirement for all DPRK and Russia-adjacent investigation records', 'Retain technology sector EDD outcomes in designated case management system'], owner: 'Sanctions Operations', deadline: '2024-12-12' },
      { code: 'FA14', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Investigators require awareness of cross-program DPRK/Russia exposure and dual-use semiconductor screening to effectively handle related alerts.', actions: ['Issue advisory briefing on DPRK/Russia cross-program risk to all investigation and screening staff', 'Provide targeted technical briefing on dual-use semiconductor controls to trade finance compliance team'], owner: 'Sanctions Learning', deadline: '2024-12-12' },
      { code: 'FA15', rating: 'LOW', status: 'NO_ACTION', rationale: 'No change to suitability requirements for sanctions personnel arising from this resolution.', actions: [] },
      { code: 'FA16', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Staff awareness of DPRK arms embargo extension, dual-use provisions, and PMC-adjacent designation precedent should be incorporated into the next training cycle.', actions: ['Schedule awareness session on DPRK arms embargo provisions and dual-use semiconductor controls for trade finance and correspondent banking teams', 'Update training materials to reflect PMC-adjacent entity designation precedent and cross-program risk scenarios'], owner: 'Sanctions Learning', deadline: '2024-12-20' },
    ],
  },
  {
    id: 'OFSI-GL-2024-AME-0091',
    source: 'UK OFSI',
    sourceAuthority: 'Office of Financial Sanctions Implementation — HM Treasury',
    jurisdiction: 'United Kingdom',
    type: 'AMENDMENT',
    title: 'OFSI Amended General License INT/2024/3892 — Russian Oil Price Cap',
    pubDate: '2024-11-20T11:00:00Z',
    timestamp: '2024-11-20T11:01:35Z',
    ingestionLatency: 95,
    originalDoc: 'OFSI General License INT/2024/3892 (Amendment) — Oil Price Cap',
    sourceURL: 'ofsistorage.blob.core.windows.net/publishlive/ConList.xml',
    entities: ['Rosneft Oil Co.', 'Sovcomflot PJSC', 'Gazprom Neft', 'Novatek PJSC'],
    sectors: ['Energy', 'Shipping', 'Marine Insurance', 'Trade Finance'],
    urgency: 'MEDIUM',
    regime: 'Russia (Sanctions) (EU Exit) Regulations 2019 / Oil Price Cap Coalition',
    executiveSummary: 'OFSI has amended the UK General License for Russian oil, reducing the price cap to $52/bbl from 1 January 2025 and introducing strict attestation requirements for UK P&I clubs and marine insurers. Existing coverage is void without updated attestations by year-end.',
    sourceFacts: [
      { label: 'General License reference', value: 'INT/2024/3892 (Amendment)' },
      { label: 'Previous price cap', value: '$60.00 per barrel' },
      { label: 'New price cap', value: '$52.00 per barrel' },
      { label: 'Effective date', value: '1 January 2025' },
      { label: 'Attestation deadline', value: '31 December 2024 — existing coverage void after this date without renewal' },
      { label: 'New attestation requirement', value: 'Mandatory for UK-based P&I clubs and marine insurers' },
      { label: 'Reporting threshold', value: 'Enhanced reporting for transactions above $2,000,000 per cargo' },
      { label: 'Issuing authority', value: 'OFSI under Russia (Sanctions) (EU Exit) Regulations 2019, Reg. 61(A)' },
    ],
    interpretationRows: [
      { point: 'The reduction from $60/bbl to $52/bbl narrows the margin to prevailing ESPO blend prices. At these levels, attestation accuracy becomes more commercially sensitive — a modest price movement above the cap would render an otherwise compliant transaction unlicensed.', tag: 'MARKET SENSITIVITY' },
      { point: 'UK P&I clubs that fail to obtain updated attestations before 31 December 2024 will lose general license coverage. Any P&I cover or indemnity payment without valid attestations would constitute provision of a financial service without a license — a criminal offence under the Russia Regulations.', tag: 'LEGAL RISK' },
      { point: 'The $2m reporting threshold is lower than many institutions\' existing de minimis thresholds. Internal monitoring processes built around higher thresholds may not capture cargo facilities now in scope; the per-cargo basis complicates aggregation logic.', tag: 'OPERATIONAL IMPACT' },
    ],
    developments: [
      'Price cap reduced from $60/bbl to $52/bbl — effective 01 January 2025',
      'Strict attestation regime introduced for UK P&I clubs and marine insurers',
      'Existing general license coverage void without updated attestations by 31 December 2024',
      'Reporting obligations for transactions above $2m per cargo tightened',
    ],
    impactScore: 51,
    businessImpact: [
      'UK marine insurance entities must update price attestation procedures before year-end',
      'Trade finance facilities for compliant Russian oil trade require amended documentation',
      'Correspondent relationships with Russian-linked shipping entities need re-evaluation',
    ],
    recommendations: [
      { action: 'Update oil price cap compliance procedures for all UK insurance entities by 01/01/2025', owner: 'UK Regulatory Compliance', deadline: '2024-12-20', priority: 'URGENT' },
      { action: 'Issue revised attestation template to P&I club and marine insurance counterparties', owner: 'Marine Finance', deadline: '2024-12-13', priority: 'ROUTINE' },
      { action: 'Review trade finance documentation for Russian oil cargo facilities above $2m', owner: 'Trade Finance', deadline: '2024-12-20', priority: 'ROUTINE' },
    ],
    frameworkAssessment: [
      { code: 'FA01', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Russian oil-related exposure must be recalibrated to reflect the lower price cap threshold. Activities compliant at $60/bbl may now require re-assessment at $52/bbl.', actions: ['Review and update Russian oil exposure assessment to reflect $52/bbl price cap threshold', 'Re-assess all oil cargo trade finance facilities against the revised cap before 1 January 2025'], owner: 'Head of Sanctions', deadline: '2024-12-20' },
      { code: 'FA02', rating: 'LOW', status: 'NO_ACTION', rationale: 'No new entity designations. Existing customer and counterparty CDD files remain adequate. No EDD uplift required solely from this amendment.', actions: [] },
      { code: 'FA03', rating: 'LOW', status: 'NO_ACTION', rationale: 'No changes to the UK consolidated sanctions list. Existing entity screening is unaffected by the price cap amendment.', actions: [] },
      { code: 'FA04', rating: 'LOW', status: 'NO_ACTION', rationale: 'No new designations triggering rescreening obligations. Periodic rescreening schedule unchanged.', actions: [] },
      { code: 'FA05', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Payment screening for Russian oil cargo transactions must incorporate price verification against the revised $52/bbl cap before processing.', actions: ['Update payment screening procedures to include $52/bbl price verification for Russian crude cargo transactions', 'Configure payment review workflow to flag oil cargo payments above the revised cap for enhanced review'], owner: 'Payments Compliance', deadline: '2024-12-20' },
      { code: 'FA06', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Price cap threshold in screening systems must be updated from $60/bbl to $52/bbl effective 1 January 2025 and validated before go-live.', actions: ['Update price cap threshold in all screening systems to $52/bbl effective 1 January 2025', 'Conduct user acceptance testing of revised price cap screening rules before year-end'], owner: 'Screening Technology', deadline: '2024-12-27' },
      { code: 'FA07', rating: 'LOW', status: 'NO_ACTION', rationale: 'No sanctions list changes. List management processes unaffected by this general license amendment.', actions: [] },
      { code: 'FA08', rating: 'LOW', status: 'NO_ACTION', rationale: 'No new designations. Alert handling processes do not require update.', actions: [] },
      { code: 'FA09', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'QA review of attestation processes and price verification procedures is required to confirm they meet the new OFSI attestation standard before year-end.', actions: ['Conduct QA review of updated price attestation procedures against OFSI requirements', 'Verify that attestation sign-off process meets the evidential standard required by the amended General License'], owner: 'Quality Assurance', deadline: '2024-12-27' },
      { code: 'FA10', rating: 'MEDIUM', status: 'ESCALATION_REQUIRED', rationale: 'P&I clubs operating without renewed attestations from 1 January 2025 face potential unlicensed activity. This creates a criminal liability risk that warrants escalation before year-end.', actions: ['Escalate year-end attestation deadline to Head of Sanctions and UK Compliance Director immediately', 'Confirm all UK P&I club and marine insurer attestations are renewed before 31 December 2024; document each confirmation'], owner: 'UK Regulatory Compliance', deadline: '2024-12-20' },
      { code: 'FA11', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Price cap compliance status for Russian oil cargo transactions should be tracked and reported in monthly sanctions MI to demonstrate adherence to revised threshold.', actions: ['Update MI reporting template to include Russian oil price cap compliance metrics at revised $52/bbl threshold', 'Report pre-year-end attestation renewal progress to MLRO in December MI cycle'], owner: 'Sanctions MI', deadline: '2024-12-20' },
      { code: 'FA12', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Third-party P&I clubs and marine insurers must renew attestations under the amended General License. Failure to do so creates shared liability exposure.', actions: ['Issue revised attestation template to all P&I club and marine insurance counterparties by 13 December 2024', 'Confirm receipt and completion of renewed attestations from all third parties before 31 December 2024'], owner: 'Marine Finance', deadline: '2024-12-13' },
      { code: 'FA13', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Attestation records, price verification documentation, and General License compliance evidence must be maintained as auditable records under OFSI requirements.', actions: ['Implement attestation record-keeping protocol for all Russian oil cargo transactions above $2m', 'Ensure all price verification evidence is stored in the designated sanctions document management system with defined retention period'], owner: 'Sanctions Operations', deadline: '2024-12-20' },
      { code: 'FA14', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Marine finance and trade finance staff require awareness of the revised price cap and attestation requirements before the 1 January 2025 effective date.', actions: ['Brief marine finance and trade finance compliance teams on revised $52/bbl price cap and attestation requirements', 'Circulate updated General License summary to all relevant business lines by 13 December 2024'], owner: 'Sanctions Learning', deadline: '2024-12-13' },
      { code: 'FA15', rating: 'LOW', status: 'NO_ACTION', rationale: 'No change to individual suitability requirements arising from this amendment.', actions: [] },
      { code: 'FA16', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Training materials for Russian sanctions and price cap compliance must be updated to reflect the revised $52/bbl threshold and new attestation regime.', actions: ['Update oil price cap training materials and e-learning modules to reflect $52/bbl threshold and new attestation requirements', 'Assign refresher training to all marine finance and trade finance staff before 1 January 2025'], owner: 'Sanctions Learning', deadline: '2024-12-27' },
    ],
  },
  {
    id: 'FATF-MER-2024-NOV',
    source: 'FATF',
    sourceAuthority: 'Financial Action Task Force — FATF Secretariat, Paris',
    jurisdiction: 'Multilateral',
    type: 'ADVISORY',
    title: 'FATF Plenary — Philippines Placed Under Increased Monitoring',
    pubDate: '2024-11-18T08:00:00Z',
    timestamp: '2024-11-18T08:04:27Z',
    ingestionLatency: 267,
    originalDoc: 'FATF Plenary Outcomes — November 2024 (Increased Monitoring)',
    sourceURL: 'fatf-gafi.org/en/publications/Fatfgeneral/plenary-outcomes-november-2024.html',
    entities: ['Philippine National Bank', 'Rizal Commercial Banking Corp.', 'AMLC Philippines', 'Manila-based MSB Network'],
    sectors: ['Banking', 'MSB / Remittance', 'Real Estate', 'Crypto Assets'],
    urgency: 'MEDIUM',
    regime: 'FATF Recommendations 24, 25 & 26 / National AML/CFT Framework',
    executiveSummary: 'The FATF has placed the Philippines on its Increased Monitoring List following the 4th round Mutual Evaluation, identifying deficiencies in beneficial ownership transparency, DNFBP supervision, and enforcement. This triggers mandatory EDD obligations for all Philippine counterparty transactions.',
    sourceFacts: [
      { label: 'List action', value: 'Added to FATF Increased Monitoring List ("grey list")' },
      { label: 'Jurisdiction', value: 'Republic of the Philippines' },
      { label: 'Evaluation round', value: '4th Round Mutual Evaluation Report' },
      { label: 'Deficiency — beneficial ownership', value: 'Insufficient transparency mechanisms for legal persons and arrangements' },
      { label: 'Deficiency — DNFBP supervision', value: 'Inadequate oversight of designated non-financial businesses and professions' },
      { label: 'Deficiency — enforcement', value: 'AMLC enforcement actions disproportionate to AML/CFT risk exposure' },
      { label: 'Remediation timeline', value: '24-month action plan submitted by AMLC to FATF Plenary' },
      { label: 'Next FATF review', value: 'June 2026 FATF Plenary' },
      { label: 'Effective date', value: 'Immediate — grey list status applies from 18 November 2024' },
    ],
    interpretationRows: [
      { point: 'Grey-listing triggers mandatory EDD obligations under FATF-aligned national legislation including UK MLRs, EU AMLD6, and US BSA guidance. These are legal obligations, not advisory guidance — regulated firms that do not implement EDD within a reasonable period face supervisory action.', tag: 'REGULATORY OBLIGATION' },
      { point: 'The DNFBP supervision deficiency indicates that non-bank intermediaries in the Philippines — lawyers, accountants, real estate agents — are outside effective AML oversight. Transactions channelled through these sectors carry elevated laundering risk that standard bank-to-bank EDD will not capture.', tag: 'DNFBP RISK' },
      { point: 'The beneficial ownership deficiency means corporate structures registered in the Philippines cannot be relied upon to accurately reflect true ownership. Existing UBO declarations from Philippine-incorporated entities should be treated as unverified and subject to re-collection.', tag: 'UBO RISK' },
      { point: 'The 24-month remediation timeline means the Philippines is unlikely to exit the grey list before mid-2026. Organisations should implement enhanced monitoring designed for sustained multi-year application, not a short-term uplift.', tag: 'TIMELINE ASSESSMENT' },
    ],
    developments: [
      'Philippines added to FATF Increased Monitoring List — effective immediately',
      'Strategic deficiencies identified in beneficial ownership, DNFBP supervision, and enforcement',
      'AMLC action plan submitted with 24-month remediation timeline',
      'Next FATF review scheduled for June 2026 plenary',
    ],
    impactScore: 44,
    businessImpact: [
      'Correspondent relationships with Philippine banks require EDD review within 90 days',
      'Remittance and MSB clients with Philippine nexus flagged for enhanced transaction monitoring',
      'Real estate sector clients with Philippine interests require updated UBO verification',
    ],
    recommendations: [
      { action: 'Initiate 90-day EDD review programme for all Philippine correspondent bank relationships', owner: 'Correspondent Banking', deadline: '2025-02-18', priority: 'URGENT' },
      { action: 'Update country risk rating for Philippines to "Enhanced Monitoring" in risk framework', owner: 'Risk Framework', deadline: '2024-12-05', priority: 'URGENT' },
      { action: 'Notify retail banking and wealth divisions of enhanced CDD requirements for Filipino clients', owner: 'Retail Compliance', deadline: '2024-12-12', priority: 'ROUTINE' },
    ],
    frameworkAssessment: [
      { code: 'FA01', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Philippine counterparty exposure across correspondent banking, remittance, and real estate sectors must be re-assessed following grey-list designation and associated EDD obligations.', actions: ['Commission Philippine counterparty exposure assessment covering correspondent, MSB/remittance, real estate, and crypto sectors', 'Update country risk matrix to classify Philippines as "Enhanced Monitoring" across all business lines'], owner: 'Head of Sanctions / CRO', deadline: '2024-12-05' },
      { code: 'FA02', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'FATF grey-listing triggers mandatory EDD obligations for Philippine correspondent banks, MSBs, and real estate clients under national AML legislation. A structured 90-day EDD review programme is required.', actions: ['Launch 90-day EDD review programme for all Philippine correspondent bank relationships', 'Issue EDD questionnaire incorporating UBO re-verification to all Philippine-nexus MSB and remittance clients', 'Escalate to Head of Correspondent Banking — 90-day window is a regulatory requirement, not advisory'], owner: 'Correspondent Banking / Due Diligence', deadline: '2025-02-18' },
      { code: 'FA03', rating: 'LOW', status: 'NO_ACTION', rationale: 'No new sanctions designations arising from FATF grey-listing. Entity screening processes are unaffected.', actions: [] },
      { code: 'FA04', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Event-driven rescreening of Philippine counterparties against updated country risk profile is required. Ongoing screening frequency for Philippine relationships should be increased.', actions: ['Trigger event-driven rescreening for all Philippine correspondent bank and MSB relationships', 'Increase ongoing screening frequency to quarterly for all Philippine-nexus relationships for the duration of grey-list status'], owner: 'Screening Operations', deadline: '2024-12-12' },
      { code: 'FA05', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Transactions involving Philippine counterparties should be subject to enhanced monitoring rules to detect patterns consistent with FATF-identified AML/CFT deficiencies.', actions: ['Implement enhanced transaction monitoring rules for Philippine-nexus payment flows', 'Flag remittance and MSB transactions with Philippine beneficiaries or originators for enhanced review'], owner: 'Payments Compliance', deadline: '2024-12-12' },
      { code: 'FA06', rating: 'LOW', status: 'NO_ACTION', rationale: 'No screening system recalibration required. Entity detection capability unaffected by grey-listing.', actions: [] },
      { code: 'FA07', rating: 'LOW', status: 'NO_ACTION', rationale: 'No sanctions list updates. List management processes unaffected.', actions: [] },
      { code: 'FA08', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Alert volumes from Philippine counterparty transactions may increase following enhanced monitoring rule implementation. Investigation capacity should be assessed.', actions: ['Brief investigation team on FATF grey-listing and associated DNFBP and UBO risk typologies for Philippine transactions', 'Review investigation queue capacity to absorb expected increase in Philippine-nexus alerts'], owner: 'Sanctions Investigations', deadline: '2024-12-12' },
      { code: 'FA09', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'QA review of EDD file quality for Philippine correspondent relationships is required to confirm they meet the elevated standard required under grey-list EDD obligations.', actions: ['Conduct QA review of EDD files for existing Philippine correspondent relationships against enhanced monitoring standard', 'Report QA outcomes to Compliance Director; flag any deficiencies for remediation'], owner: 'Quality Assurance', deadline: '2025-02-28' },
      { code: 'FA10', rating: 'LOW', status: 'NO_ACTION', rationale: 'No immediate sanctions breach risk from grey-listing. The risk is indirect AML exposure, not a direct sanctions violation.', actions: [] },
      { code: 'FA11', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'Country risk rating change for Philippines must be reflected in MI reporting, and the 90-day EDD review programme progress must be tracked and reported to governance.', actions: ['Update country risk MI dashboard to reflect Philippines "Enhanced Monitoring" status across all business lines', 'Establish monthly MI reporting on 90-day EDD review programme progress for senior management and board', 'Report Philippines grey-list impact assessment to Risk Committee in next governance cycle'], owner: 'Sanctions MI', deadline: '2024-12-05' },
      { code: 'FA12', rating: 'HIGH', status: 'ESCALATION_REQUIRED', rationale: 'Third-party Philippine correspondent banks used for outsourced payment services require mandatory EDD review. Shared grey-list risk must be assessed and documented.', actions: ['Initiate EDD review for all Philippine banks used in outsourced payment or correspondent services', 'Update outsourcing agreements and third-party risk assessments to reflect grey-list status and enhanced obligations', 'Escalate any third parties that cannot demonstrate adequate AML controls to senior risk management for relationship review'], owner: 'Third-party Risk / Correspondent Banking', deadline: '2025-02-18' },
      { code: 'FA13', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'EDD records, UBO re-verification documents, and enhanced monitoring decisions for Philippine relationships must be maintained as audit-ready records throughout the grey-list period.', actions: ['Implement document retention protocol for all Philippine-nexus EDD records with 7-year retention', 'Ensure UBO re-verification documentation is stored with original onboarding files and flagged for review at next periodic review'], owner: 'Sanctions Operations', deadline: '2024-12-12' },
      { code: 'FA14', rating: 'MEDIUM', status: 'ACTION_REQUIRED', rationale: 'Relationship managers, correspondents, and EDD analysts require awareness of Philippine grey-list implications and DNFBP/UBO risk typologies.', actions: ['Issue Philippines grey-list advisory memo to all client-facing and due diligence staff', 'Brief EDD analysts on DNFBP and UBO risk typologies specific to Philippines grey-list deficiencies'], owner: 'Sanctions Learning', deadline: '2024-12-05' },
      { code: 'FA15', rating: 'LOW', status: 'NO_ACTION', rationale: 'No change to individual suitability requirements. Existing role-based competency frameworks remain adequate.', actions: [] },
      { code: 'FA16', rating: 'HIGH', status: 'ACTION_REQUIRED', rationale: 'All client-facing and compliance staff must be trained on FATF grey-list implications, mandatory EDD obligations, and Philippines-specific AML typologies. This is a legal compliance requirement.', actions: ['Deliver mandatory Philippines grey-list awareness training to all client-facing and compliance staff within 30 days', 'Update AML/CFT training materials to include FATF grey-list EDD obligations and Philippines DNFBP/UBO risk typologies', 'Record training completion in LMS and report completion rates to Head of Compliance'], owner: 'Sanctions Learning', deadline: '2024-12-18' },
    ],
  },
]

// ── Constants ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 0 as StageId, code: '01', label: 'HORIZON SCANNING', sub: 'Source ingestion & monitoring' },
  { id: 1 as StageId, code: '02', label: 'INTERPRETATION', sub: 'Regulatory analysis & context' },
  { id: 2 as StageId, code: '03', label: 'ORGANISATIONAL IMPACT', sub: 'Domain & framework assessment' },
  { id: 3 as StageId, code: '04', label: 'RECOMMENDATIONS', sub: 'Action planning & review queue' },
]
const URGENCY_COLOR: Record<Urgency, string> = { CRITICAL: '#E8383B', HIGH: '#F5B000', MEDIUM: '#4A9FE8', LOW: '#00B87A' }
const IMPACT_COLOR: Record<ImpactRating, string> = { HIGH: '#E8383B', MEDIUM: '#F5B000', LOW: '#4A9FE8', NO_IMPACT: '#3A3A46' }
const IMPACT_TEXT: Record<ImpactRating, string> = { HIGH: '#E8383B', MEDIUM: '#F5B000', LOW: '#4A9FE8', NO_IMPACT: '#6B7280' }
const STATUS_BADGE: Record<ActionStatus, { color: string; label: string }> = {
  ESCALATION_REQUIRED: { color: '#E8383B', label: 'ESCALATION REQUIRED' },
  ACTION_REQUIRED: { color: '#F5B000', label: 'ACTION REQUIRED' },
  NO_ACTION: { color: '#3A3A46', label: 'NO ACTION' },
}
const SOURCE_TYPE_LABEL: Record<SourceType, string> = { API: 'API FEED', RSS_FEED: 'RSS FEED', WEBSITE: 'WEBSITE', EMAIL_ALERT: 'EMAIL ALERT' }
const STATUS_COLOR: Record<IngestionStatus, string> = { SUCCESS: '#00B87A', FAILED: '#E8383B', PARTIAL: '#F5B000' }

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' +
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC'

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }
const COND: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif" }
const SANS: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }

// ── Shared sub-components ──────────────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...MONO, fontSize: '10px', letterSpacing: '0.15em', color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' as const }}>
      {children}
    </div>
  )
}

function DataRow({ label, value, accent, url, tag }: { label: string; value: string; accent?: string; url?: boolean; tag?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1E2028' }}>
      <span style={{ ...MONO, fontSize: '10px', color: '#6B7280', letterSpacing: '0.06em', minWidth: '200px', flexShrink: 0, textTransform: 'uppercase' as const, paddingTop: '1px' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        <span style={{ ...MONO, fontSize: '11px', color: url ? '#4A9FE8' : (accent || '#E2E8F0'), lineHeight: 1.5, wordBreak: 'break-all' as const }}>{url ? '↗ ' : ''}{value}</span>
        {tag && <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', border: '1px solid #2A2D3A', padding: '1px 5px', flexShrink: 0 }}>{tag}</span>}
      </div>
    </div>
  )
}

// ── Sources Panel ──────────────────────────────────────────────────────────
function SourcesPanel({ onClose }: { onClose: () => void }) {
  const total = MONITORED_SOURCES.length
  const success = MONITORED_SOURCES.filter(s => s.status === 'SUCCESS').length
  const failed = MONITORED_SOURCES.filter(s => s.status === 'FAILED').length
  const partial = MONITORED_SOURCES.filter(s => s.status === 'PARTIAL').length
  const byType = (t: SourceType) => MONITORED_SOURCES.filter(s => s.type === t).length

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '540px', background: '#0C0D12', borderLeft: '2px solid #FFFFFF', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2A2D3A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ ...COND, fontSize: '20px', fontWeight: 800, letterSpacing: '0.04em' }}>MONITORED SOURCES</div>
            <div style={{ ...MONO, fontSize: '10px', color: '#6B7280', marginTop: '4px', letterSpacing: '0.08em' }}>{total} SOURCES · LIVE INGESTION PIPELINE</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #2A2D3A', color: '#9CA3AF', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #2A2D3A', flexShrink: 0 }}>
          {[{ label: 'SUCCESS', val: success, color: '#00B87A' }, { label: 'FAILED', val: failed, color: '#E8383B' }, { label: 'PARTIAL', val: partial, color: '#F5B000' }, { label: 'TOTAL', val: total, color: '#E2E8F0' }].map((s, i) => (
            <div key={s.label} style={{ padding: '14px 16px', borderRight: i < 3 ? '1px solid #2A2D3A' : 'none' }}>
              <div style={{ ...MONO, fontSize: '9px', color: '#6B7280', letterSpacing: '0.1em', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ ...COND, fontSize: '28px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #2A2D3A', flexShrink: 0 }}>
          {[{ label: 'API FEEDS', val: byType('API') }, { label: 'WEBSITES', val: byType('WEBSITE') }, { label: 'RSS FEEDS', val: byType('RSS_FEED') }, { label: 'EMAIL', val: byType('EMAIL_ALERT') }].map((t, i) => (
            <div key={t.label} style={{ padding: '10px 16px', borderRight: i < 3 ? '1px solid #2A2D3A' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', letterSpacing: '0.08em' }}>{t.label}</span>
              <span style={{ ...MONO, fontSize: '12px', color: '#9CA3AF' }}>{t.val}</span>
            </div>
          ))}
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {MONITORED_SOURCES.map((src, i) => (
            <div key={i} style={{ padding: '14px 24px', borderBottom: '1px solid #181920', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
              <div>
                <div style={{ ...SANS, fontSize: '13px', color: '#E2E8F0', fontWeight: 500, marginBottom: '5px' }}>{src.name}</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                  <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', border: '1px solid #2A2D3A', padding: '1px 5px' }}>{SOURCE_TYPE_LABEL[src.type]}</span>
                  <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', border: '1px solid #2A2D3A', padding: '1px 5px' }}>{src.jurisdiction}</span>
                  <span style={{ ...MONO, fontSize: '9px', color: '#4B5563' }}>{src.url}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                <div style={{ ...MONO, fontSize: '10px', color: STATUS_COLOR[src.status], border: `1px solid ${STATUS_COLOR[src.status]}`, padding: '2px 7px', marginBottom: '5px', display: 'inline-block' }}>{src.status}</div>
                <div style={{ ...MONO, fontSize: '9px', color: '#4B5563' }}>{src.latencyMs !== null ? `${src.latencyMs}ms` : '—'} · {src.lastPoll}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Stage 0: Horizon Scanning ──────────────────────────────────────────────
function ScanningView({ item }: { item: Item }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      <div>
        <SLabel>Source Classification</SLabel>
        <div style={{ border: '1px solid #2A2D3A', padding: '4px 16px' }}>
          <DataRow label="Official Source & Authority" value={item.sourceAuthority} />
          <DataRow label="Jurisdiction" value={item.jurisdiction} />
          <DataRow label="Sanctions Regime" value={item.regime} />
          <DataRow label="Publication Date & Time" value={fmtDateTime(item.pubDate)} />
          <DataRow label="Original Document" value={item.originalDoc} />
          <DataRow label="Source URL" value={item.sourceURL} url />
          <DataRow label="Document Type" value={item.type} accent="#F5B000" />
          <DataRow label="Ingestion Timestamp" value={fmtDateTime(item.timestamp)} tag={`+${item.ingestionLatency}s latency`} />
          <DataRow label="Reference ID" value={item.id} />
        </div>
      </div>
      <div>
        <SLabel>Designated Entities ({item.entities.length})</SLabel>
        <div style={{ border: '1px solid #2A2D3A', marginBottom: '28px' }}>
          {item.entities.map((e, i) => (
            <div key={e} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: i < item.entities.length - 1 ? '1px solid #1E2028' : 'none' }}>
              <span style={{ width: '5px', height: '5px', background: URGENCY_COLOR[item.urgency], flexShrink: 0, display: 'block' }} />
              <span style={{ ...SANS, fontSize: '13px', color: '#E2E8F0' }}>{e}</span>
            </div>
          ))}
        </div>
        <SLabel>Executive Summary</SLabel>
        <div style={{ border: '1px solid #2A2D3A', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00B87A', display: 'block' }} />
            <span style={{ ...MONO, fontSize: '9px', color: '#00B87A', letterSpacing: '0.1em' }}>AGENTIC SUMMARY · AUTO-GENERATED</span>
          </div>
          <p style={{ ...SANS, fontSize: '13px', lineHeight: 1.75, color: '#D1D5DB', margin: 0 }}>{item.executiveSummary}</p>
        </div>
      </div>
    </div>
  )
}

// ── Stage 1: Interpretation ────────────────────────────────────────────────
function InterpretationView({ item }: { item: Item }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid #2A2D3A' }}>
      <div style={{ borderRight: '1px solid #2A2D3A' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2D3A', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ ...COND, fontSize: '16px', fontWeight: 700, letterSpacing: '0.06em' }}>SOURCE FACTS</span>
          <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', border: '1px solid #2A2D3A', padding: '2px 6px' }}>EXTRACTED · VERBATIM</span>
        </div>
        {item.sourceFacts.map((fact, i) => (
          <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #1A1B24', display: 'flex', flexDirection: 'column' as const, gap: '5px' }}>
            <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{fact.label}</span>
            <span style={{ ...SANS, fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>{fact.value}</span>
          </div>
        ))}
      </div>
      <div>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2D3A', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ ...COND, fontSize: '16px', fontWeight: 700, letterSpacing: '0.06em' }}>AGENT INTERPRETATION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00B87A', display: 'block' }} />
            <span style={{ ...MONO, fontSize: '9px', color: '#00B87A', letterSpacing: '0.08em' }}>AUTO-GENERATED</span>
          </div>
        </div>
        {item.interpretationRows.map((row, i) => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid #1A1B24', display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
            <span style={{ ...MONO, fontSize: '9px', color: '#F5B000', border: '1px solid #F5B00033', background: '#F5B0000A', padding: '2px 8px', alignSelf: 'flex-start', letterSpacing: '0.08em' }}>{row.tag}</span>
            <p style={{ ...SANS, fontSize: '13px', color: '#D1D5DB', lineHeight: 1.7, margin: 0 }}>{row.point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stage 2: Organisational & Domain Impact ────────────────────────────────
function DomainImpactView({ item }: { item: Item }) {
  const fa = item.frameworkAssessment
  const escCount = fa.filter(f => f.status === 'ESCALATION_REQUIRED').length
  const actCount = fa.filter(f => f.status === 'ACTION_REQUIRED').length
  const noActCount = fa.filter(f => f.status === 'NO_ACTION').length
  const highCount = fa.filter(f => f.rating === 'HIGH').length
  const medCount = fa.filter(f => f.rating === 'MEDIUM').length
  const lowCount = fa.filter(f => f.rating === 'LOW').length
  const noImpCount = fa.filter(f => f.rating === 'NO_IMPACT').length

  const sortedFa = [...fa].sort((a, b) => {
    const order: Record<ImpactRating, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, NO_IMPACT: 3 }
    return order[a.rating] - order[b.rating]
  })

  const areaName = (code: string) => FRAMEWORK_AREAS.find(f => f.code === code)?.name ?? code

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #2A2D3A', marginBottom: '24px' }}>
        {[
          { label: 'ESCALATION', val: escCount, color: '#E8383B' },
          { label: 'ACTION REQ.', val: actCount, color: '#F5B000' },
          { label: 'NO ACTION', val: noActCount, color: '#3A3A46' },
          { label: '', val: null, color: '' },
          { label: 'HIGH IMPACT', val: highCount, color: '#E8383B' },
          { label: 'MEDIUM', val: medCount, color: '#F5B000' },
          { label: 'LOW / NONE', val: lowCount + noImpCount, color: '#4A9FE8' },
        ].map((s, i) => s.val === null ? (
          <div key={i} style={{ borderRight: '1px solid #2A2D3A', background: '#0E0F14' }} />
        ) : (
          <div key={i} style={{ padding: '12px 16px', borderRight: i < 6 ? '1px solid #2A2D3A' : 'none' }}>
            <div style={{ ...MONO, fontSize: '8px', color: '#6B7280', letterSpacing: '0.1em', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ ...COND, fontSize: '28px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Framework area table */}
      <div style={{ border: '1px solid #2A2D3A' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '72px 220px 100px 160px 1fr', padding: '10px 16px', borderBottom: '1px solid #2A2D3A', background: '#0E0F14' }}>
          {['CODE', 'FRAMEWORK AREA', 'IMPACT', 'ACTION STATUS', 'RATIONALE'].map(h => (
            <span key={h} style={{ ...MONO, fontSize: '9px', color: '#4B5563', letterSpacing: '0.12em' }}>{h}</span>
          ))}
        </div>
        {sortedFa.map((f, i) => {
          const impColor = IMPACT_TEXT[f.rating]
          const statColor = STATUS_BADGE[f.status].color
          return (
            <div key={f.code} style={{ display: 'grid', gridTemplateColumns: '72px 220px 100px 160px 1fr', padding: '12px 16px', borderBottom: i < sortedFa.length - 1 ? '1px solid #181920' : 'none', alignItems: 'start', background: f.rating === 'HIGH' ? '#140D0D' : f.rating === 'MEDIUM' ? '#14110A' : 'transparent' }}>
              <span style={{ ...MONO, fontSize: '11px', color: '#4B5563' }}>{f.code}</span>
              <span style={{ ...SANS, fontSize: '12px', color: '#E2E8F0', fontWeight: 500, lineHeight: 1.4, paddingRight: '12px' }}>{areaName(f.code)}</span>
              <span style={{ ...MONO, fontSize: '10px', color: impColor, fontWeight: 600 }}>{f.rating.replace('_', ' ')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', background: statColor, flexShrink: 0, display: 'block' }} />
                <span style={{ ...MONO, fontSize: '9px', color: statColor, letterSpacing: '0.05em' }}>{STATUS_BADGE[f.status].label}</span>
              </div>
              <span style={{ ...SANS, fontSize: '12px', color: '#9CA3AF', lineHeight: 1.5 }}>{f.rationale}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stage 3: Framework Recommendations ────────────────────────────────────
type RecFilter = 'ALL' | 'ESCALATION_REQUIRED' | 'ACTION_REQUIRED' | 'NO_ACTION'

function FrameworkRecommendationsView({ item }: { item: Item }) {
  const [filter, setFilter] = useState<RecFilter>('ALL')

  const fa = item.frameworkAssessment
  const escCount = fa.filter(f => f.status === 'ESCALATION_REQUIRED').length
  const actCount = fa.filter(f => f.status === 'ACTION_REQUIRED').length
  const noActCount = fa.filter(f => f.status === 'NO_ACTION').length

  const sortedFa = [...fa].sort((a, b) => {
    const order: Record<ActionStatus, number> = { ESCALATION_REQUIRED: 0, ACTION_REQUIRED: 1, NO_ACTION: 2 }
    return order[a.status] - order[b.status]
  })
  const visible = filter === 'ALL' ? sortedFa : sortedFa.filter(f => f.status === filter)
  const areaName = (code: string) => FRAMEWORK_AREAS.find(f => f.code === code)?.name ?? code

  const tabs: { key: RecFilter; label: string; count: number; color: string }[] = [
    { key: 'ALL', label: 'ALL AREAS', count: fa.length, color: '#E2E8F0' },
    { key: 'ESCALATION_REQUIRED', label: 'ESCALATION REQUIRED', count: escCount, color: '#E8383B' },
    { key: 'ACTION_REQUIRED', label: 'ACTION REQUIRED', count: actCount, color: '#F5B000' },
    { key: 'NO_ACTION', label: 'NO ACTION', count: noActCount, color: '#6B7280' },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #2A2D3A', marginBottom: '24px' }}>
        {tabs.map((tab, i) => {
          const active = filter === tab.key
          return (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              style={{ ...MONO, fontSize: '10px', letterSpacing: '0.08em', padding: '10px 20px', border: 'none', borderRight: i < tabs.length - 1 ? '1px solid #2A2D3A' : 'none', borderBottom: active ? '2px solid #FFFFFF' : '2px solid transparent', background: 'transparent', color: active ? '#FFFFFF' : '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.15s', marginBottom: '-1px' }}>
              {tab.label}
              <span style={{ ...MONO, fontSize: '10px', color: active ? tab.color : '#4B5563', border: `1px solid ${active ? tab.color : '#2A2D3A'}`, padding: '0px 5px', lineHeight: '16px' }}>{tab.count}</span>
            </button>
          )
        })}
      </div>

      {/* Framework area cards */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
        {visible.map((f) => {
          const sConfig = STATUS_BADGE[f.status]
          const impColor = IMPACT_TEXT[f.rating]
          const aName = areaName(f.code)
          const isEsc = f.status === 'ESCALATION_REQUIRED'
          const isAct = f.status === 'ACTION_REQUIRED'
          const isNoAct = f.status === 'NO_ACTION'

          if (isNoAct && filter !== 'NO_ACTION' && filter !== 'ALL') return null

          return (
            <div key={f.code} style={{ border: `1px solid ${isEsc ? '#E8383B44' : isAct ? '#F5B00033' : '#1E2028'}`, background: isEsc ? '#140D0D' : isAct ? '#13110A' : '#0E0F14' }}>
              {/* Card header */}
              <div style={{ padding: '14px 20px', borderBottom: isNoAct ? 'none' : '1px solid #1E2028', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...MONO, fontSize: '10px', color: '#4B5563' }}>{f.code}</span>
                <span style={{ ...COND, fontSize: '15px', fontWeight: 700, color: '#E2E8F0', flex: 1 }}>{aName}</span>
                <span style={{ ...MONO, fontSize: '9px', color: impColor, border: `1px solid ${impColor}33`, padding: '2px 7px', letterSpacing: '0.06em' }}>
                  {f.rating.replace('_', ' ')} IMPACT
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${sConfig.color}44`, padding: '3px 10px' }}>
                  <span style={{ width: '5px', height: '5px', background: sConfig.color, flexShrink: 0, display: 'block' }} />
                  <span style={{ ...MONO, fontSize: '9px', color: sConfig.color, letterSpacing: '0.06em' }}>{sConfig.label}</span>
                </div>
              </div>

              {/* Actions */}
              {f.actions.length > 0 && (
                <div style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                    {f.actions.map((action, ai) => (
                      <div key={ai} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ ...MONO, fontSize: '10px', color: sConfig.color, minWidth: '16px', paddingTop: '2px', flexShrink: 0 }}>{'→'}</span>
                        <span style={{ ...SANS, fontSize: '13px', color: '#D1D5DB', lineHeight: 1.55 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                  {(f.owner || f.deadline) && (
                    <div style={{ display: 'flex', gap: '24px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1E2028' }}>
                      {f.owner && <span style={{ ...MONO, fontSize: '10px', color: '#6B7280' }}>OWNER <span style={{ color: '#9CA3AF' }}>{f.owner}</span></span>}
                      {f.deadline && <span style={{ ...MONO, fontSize: '10px', color: '#6B7280' }}>DUE <span style={{ color: isEsc ? '#E8383B' : '#9CA3AF' }}>{fmtDate(f.deadline)}</span></span>}
                    </div>
                  )}
                </div>
              )}

              {/* No action rationale */}
              {isNoAct && (
                <div style={{ padding: '0 20px 14px' }}>
                  <span style={{ ...SANS, fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>{f.rationale}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [stage, setStage] = useState<StageId>(0)
  const [selectedId, setSelectedId] = useState(DATA[0].id)
  const [pulse, setPulse] = useState(true)
  const [scanCount, setScanCount] = useState(1247)
  const [now, setNow] = useState(new Date())
  const [showSources, setShowSources] = useState(false)

  const item = DATA.find(d => d.id === selectedId)!

  useEffect(() => {
    const t = setInterval(() => {
      setPulse(p => !p)
      setScanCount(c => c + Math.floor(Math.random() * 4 + 1))
      setNow(new Date())
    }, 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ ...SANS, background: '#0C0D12', minHeight: '100vh', color: '#E2E8F0', display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* HEADER */}
      <header style={{ borderBottom: '2px solid #FFFFFF', padding: '0 24px', display: 'flex', alignItems: 'center', height: '52px', gap: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{ ...COND, fontSize: '20px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>SANCTIONS</span>
          <span style={{ ...COND, fontSize: '20px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#F5B000' }}>HORIZON</span>
          <span style={{ ...COND, fontSize: '20px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>&nbsp;SCANNER</span>
        </div>
        <div style={{ width: '1px', height: '28px', background: '#2A2D3A' }} />
        <span style={{ ...MONO, fontSize: '10px', color: '#4B5563', letterSpacing: '0.05em' }}>INTELLIGENCE PLATFORM v3.2 · CLASSIFICATION: RESTRICTED</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: pulse ? '#00B87A' : '#065F46', display: 'block', transition: 'background 0.6s', boxShadow: pulse ? '0 0 6px #00B87A' : 'none' }} />
          <span style={{ ...MONO, fontSize: '10px', color: '#00B87A', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
        <div style={{ width: '1px', height: '28px', background: '#2A2D3A' }} />
        <button onClick={() => setShowSources(true)}
          style={{ ...MONO, fontSize: '10px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#E2E8F0')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
          <span style={{ color: '#F5B000' }}>{scanCount.toLocaleString()}</span>&nbsp;SOURCES ↗
        </button>
        <div style={{ width: '1px', height: '28px', background: '#2A2D3A' }} />
        <span style={{ ...MONO, fontSize: '10px', color: '#6B7280' }}>{now.toISOString().slice(0, 16).replace('T', ' ')} UTC</span>
      </header>

      {/* STAGE TABS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #2A2D3A', flexShrink: 0 }}>
        {STAGES.map((s, i) => {
          const active = stage === s.id
          return (
            <button key={s.id} onClick={() => setStage(s.id)}
              style={{ border: 'none', borderRight: i < 3 ? '1px solid #2A2D3A' : 'none', background: active ? '#FFFFFF' : 'transparent', color: active ? '#0C0D12' : '#6B7280', padding: '12px 24px', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: '16px', transition: 'background 0.15s, color 0.15s' }}>
              <span style={{ ...COND, fontSize: '32px', fontWeight: 800, lineHeight: 1, opacity: active ? 1 : 0.25, color: active ? '#0C0D12' : '#F5B000' }}>{s.code}</span>
              <div>
                <div style={{ ...COND, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{s.label}</div>
                <div style={{ ...SANS, fontSize: '11px', opacity: 0.65, marginTop: '2px' }}>{s.sub}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: feed */}
        <div style={{ borderRight: '1px solid #2A2D3A', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #2A2D3A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ ...MONO, fontSize: '10px', color: '#6B7280', letterSpacing: '0.1em' }}>ALERTS · {DATA.length} ACTIVE</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['CRITICAL', 'HIGH'] as Urgency[]).map(u => (
                <span key={u} style={{ ...MONO, fontSize: '9px', color: URGENCY_COLOR[u], border: `1px solid ${URGENCY_COLOR[u]}`, padding: '2px 6px' }}>
                  {DATA.filter(d => d.urgency === u).length} {u}
                </span>
              ))}
            </div>
          </div>
          {DATA.map(d => {
            const active = selectedId === d.id
            const color = URGENCY_COLOR[d.urgency]
            const fa = d.frameworkAssessment
            const escC = fa.filter(f => f.status === 'ESCALATION_REQUIRED').length
            const actC = fa.filter(f => f.status === 'ACTION_REQUIRED').length
            return (
              <div key={d.id} onClick={() => setSelectedId(d.id)}
                style={{ padding: '14px 16px', borderBottom: '1px solid #181920', cursor: 'pointer', background: active ? '#141520' : 'transparent', borderLeft: `3px solid ${active ? color : 'transparent'}`, transition: 'background 0.1s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', background: '#1A1B24', padding: '2px 6px' }}>{d.source}</span>
                    <span style={{ ...MONO, fontSize: '9px', color: '#6B7280' }}>{d.jurisdiction}</span>
                  </div>
                  <span style={{ ...MONO, fontSize: '9px', color, border: `1px solid ${color}`, padding: '1px 5px' }}>{d.urgency}</span>
                </div>
                <div style={{ ...COND, fontSize: '14px', fontWeight: 600, lineHeight: 1.35, marginBottom: '8px', color: active ? '#FFFFFF' : '#D1D5DB' }}>{d.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ ...MONO, fontSize: '9px', color: '#4B5563' }}>{d.id}</span>
                  <span style={{ ...MONO, fontSize: '9px', color: '#4B5563' }}>{fmtDate(d.pubDate)}</span>
                </div>
                {(stage === 2 || stage === 3) && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                    {escC > 0 && <span style={{ ...MONO, fontSize: '9px', color: '#E8383B', border: '1px solid #E8383B', padding: '1px 5px' }}>{escC} ESC</span>}
                    {actC > 0 && <span style={{ ...MONO, fontSize: '9px', color: '#F5B000', border: '1px solid #F5B000', padding: '1px 5px' }}>{actC} ACT</span>}
                    <span style={{ ...MONO, fontSize: '9px', color: '#4B5563', border: '1px solid #2A2D3A', padding: '1px 5px' }}>16 AREAS</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* RIGHT: detail */}
        <div style={{ overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ borderBottom: '2px solid #FFFFFF', paddingBottom: '20px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', background: '#1A1B24', padding: '3px 8px' }}>{item.type}</span>
                <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', background: '#1A1B24', padding: '3px 8px' }}>{item.source}</span>
                <span style={{ ...MONO, fontSize: '9px', color: '#6B7280', background: '#1A1B24', padding: '3px 8px' }}>{item.jurisdiction}</span>
              </div>
              {stage !== 1 && (
                <span style={{ ...MONO, fontSize: '11px', color: URGENCY_COLOR[item.urgency], border: `2px solid ${URGENCY_COLOR[item.urgency]}`, padding: '4px 14px', fontWeight: 500, letterSpacing: '0.1em', flexShrink: 0 }}>
                  {item.urgency}
                </span>
              )}
            </div>
            <h1 style={{ ...COND, fontSize: '26px', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: '14px', color: '#FFFFFF' }}>{item.title}</h1>
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' as const }}>
              <span style={{ ...MONO, fontSize: '11px', color: '#6B7280' }}>REF <span style={{ color: '#9CA3AF' }}>{item.id}</span></span>
              <span style={{ ...MONO, fontSize: '11px', color: '#6B7280' }}>PUBLISHED <span style={{ color: '#9CA3AF' }}>{fmtDateTime(item.pubDate)}</span></span>
              {stage !== 1 && stage !== 2 && (
                <span style={{ ...MONO, fontSize: '11px', color: '#6B7280' }}>IMPACT <span style={{ color: URGENCY_COLOR[item.urgency] }}>{item.impactScore}/100</span></span>
              )}
              {stage === 2 && (
                <span style={{ ...MONO, fontSize: '11px', color: '#6B7280' }}>
                  FRAMEWORK <span style={{ color: '#E8383B' }}>{item.frameworkAssessment.filter(f => f.status === 'ESCALATION_REQUIRED').length} ESC</span>
                  <span style={{ color: '#6B7280' }}> · </span>
                  <span style={{ color: '#F5B000' }}>{item.frameworkAssessment.filter(f => f.status === 'ACTION_REQUIRED').length} ACT</span>
                </span>
              )}
            </div>
          </div>

          {stage === 0 && <ScanningView item={item} />}
          {stage === 1 && <InterpretationView item={item} />}
          {stage === 2 && <DomainImpactView item={item} />}
          {stage === 3 && <FrameworkRecommendationsView item={item} />}
        </div>
      </div>

      {showSources && <SourcesPanel onClose={() => setShowSources(false)} />}
    </div>
  )
}
