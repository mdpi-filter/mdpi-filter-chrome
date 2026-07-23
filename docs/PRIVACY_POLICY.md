# Privacy Policy for the Notandia Browser Extension

**Last updated:** July 23, 2026

Notandia, previously distributed as MDPI Filter, adds publisher context and optional formal post-publication signals while users read scholarly literature. Most processing occurs locally in the browser.

## 1. Information handled locally

The extension may inspect HTTPS pages to identify:

- DOI, PMID, and PMCID identifiers;
- MDPI-related domains, publisher metadata, links, and references;
- bibliography structure and short citation text needed to present references locally;
- formal status information returned for user-authorized DOI lookups.

The extension does not send complete page content, citation text, search queries, browsing history, or full page addresses to the developer or an analytics service.

User preferences are stored through browser extension storage. Browser synchronization may copy those settings between signed-in browsers when the user has enabled the browser's synchronization service.

## 2. External communications

### NCBI ID Converter

When NCBI lookups are enabled, the extension sends only validated DOI, PMID, or PMCID values to the NCBI ID Converter. Requests identify the application as `notandia` and omit browser cookies, other credentials, referrer information, and a developer email address.

NCBI lookups are bounded, deduplicated, batched, and time-limited. They can be disabled in advanced settings; disabling them may reduce MDPI-detection coverage.

### Optional Crossref integrity lookups

Research-integrity lookups are off by default. When the user explicitly enables **Check article and reference DOIs**, the extension sends normalized DOI identifiers to the Crossref REST API to retrieve scholarly metadata and formal update relationships such as retractions, expressions of concern, corrections, reinstatements, withdrawals, removals, and duplicate-publication findings.

Crossref requests:

- include only normalized DOI identifiers and normal network metadata such as the user's IP address;
- omit page addresses, page and citation text, browser cookies, credentials, account identifiers, analytics identifiers, and referrers;
- are limited to no more than 50 unique DOI requests per page scan and four request starts per second;
- are cancelled when the feature is disabled, the scan is replaced, or navigation begins.

Firefox additionally requires the user to grant its optional `websiteContent` data-collection permission before these DOI requests can begin.

### User-initiated GitHub reports

Selecting the report control opens a public GitHub issue form. The extension pre-fills the page origin and path but removes query parameters and fragments. Nothing is submitted automatically; the user can edit or discard the report.

## 3. Storage and retention

- Preferences remain in browser extension storage until changed, cleared, or the extension is removed.
- Detection and lookup results are held in bounded memory caches and are not used for tracking.
- Crossref lookup responses may remain in memory for up to 24 hours and disappear sooner when the background process stops.
- Per-tab reference data is cleared when navigation begins or the tab closes.
- The extension does not maintain a persistent browsing-history database or analytics profile.

## 4. Security and data-use boundaries

- The extension executes no remote code and ships no runtime npm dependencies.
- Page-derived content is rendered as text rather than injected as HTML.
- Messages and identifiers crossing extension contexts are validated and bounded.
- Network requests use HTTPS, omit credentials, and use a no-referrer policy.
- The project contains no advertising or product analytics and does not sell or rent user data.

## 5. User choices

Users can disable NCBI lookups, leave Crossref integrity lookups disabled, revoke Firefox's optional permission, change filtering preferences, clear synchronized extension data, disable the extension on selected sites, or uninstall it.

A message that no known signal was found means only that none was found in the checked records. It is not a claim that a work, journal, or publisher is reliable.

## 6. Independence and contact

Notandia is an independent open-source project. It is not affiliated with, authorized by, or endorsed by MDPI AG, Crossref, Retraction Watch, NCBI, browser vendors, or any publisher or data provider.

Questions and non-sensitive reports may be submitted through the public issue tracker at `notandia/browser-extension`. Security vulnerabilities should be reported privately as described in `SECURITY.md`.
