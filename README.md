# Notandia browser extension

**Notandia** is an independent, open-source browser extension that adds publisher context and explainable post-publication signals while preserving the existing MDPI-detection features previously distributed as **MDPI Filter**. This repository is the canonical browser-extension source for Chrome, Microsoft Edge, Firefox, and Safari.

> **Independent project:** Notandia is not affiliated with, authorized by, or endorsed by MDPI AG, Crossref, Retraction Watch, NCBI, browser vendors, or any publisher or data provider. MDPI is a registered brand of MDPI AG.

## Browser outputs

| Target | Generated release asset | Distribution status |
|---|---|---|
| Chrome | `notandia-chrome-vX.Y.Z.zip` | Uploadable to the existing Chrome Web Store item |
| Microsoft Edge | `notandia-edge-vX.Y.Z.zip` | Uploadable to the existing Microsoft Edge Add-ons product |
| Firefox | `notandia-firefox-source-vX.Y.Z.zip` | Submitted to AMO for Mozilla signing |
| Safari | `notandia-safari-source-vX.Y.Z.zip` | Local compatibility source; App Store publication deferred |

All packages are generated from the same source commit. Browser-specific manifests, store metadata, terminology restrictions, and credentials remain isolated.

## Features

- Hide or highlight MDPI results on Google, Google Scholar, PubMed, and Europe PMC.
- Mark MDPI entries in reference lists.
- Mark related inline numerical citations where page structure permits.
- Identify MDPI entries in cited-by and similar-article sections.
- Show detected references in the toolbar popup and scroll to a selected reference.
- Resolve PMID and PMCID identifiers through NCBI when direct DOI evidence is unavailable.
- Optionally check the current article and DOI-bearing references for formal Crossref/Retraction Watch update relationships.
- Show evidence type, chronology, provenance, coverage, deferred checks, and unresolved checks instead of producing an opaque quality score.
- Keep research-integrity lookups off by default and allow NCBI and integrity network features to be disabled independently.

## Identity and update compatibility

Notandia is a public-facing rebrand of released software, not a replacement extension. Existing store items and technical identities are retained so installed copies continue to receive updates.

- Chrome keeps its existing extension ID and registered CRX signing key.
- Microsoft Edge keeps its existing Product ID and extension identity.
- Firefox keeps the released Gecko ID `mdpi-filter@mdpi-filter.org`.
- Existing storage keys and MDPI-specific runtime identifiers remain where changing them could reset settings or break compatibility.
- New release files, store-facing metadata, UI labels, documentation, and public project links use Notandia.

These legacy identifiers are compatibility mechanisms, not current product branding. See [Identity compatibility](docs/IDENTITY_COMPATIBILITY.md).

## Development

Requirements:

- Node.js 24
- npm
- `zip` for creating release archives locally

Run the complete verification and build:

```bash
npm ci --ignore-scripts
npm test
npm run build
```

Generated unpacked extensions appear under:

```text
dist/chrome
dist/edge
dist/firefox
dist/safari
```

Build one target:

```bash
npm run build:target -- --target edge --version 0.1.0
```

## Releases

A protected version tag such as `v0.1.0` triggers the multi-browser release workflow. It:

1. Runs the security and regression suite.
2. Builds all browser targets independently.
3. Enforces store-specific terminology policies.
4. Creates reproducible ZIP archives.
5. Verifies each archive and manifest.
6. Publishes one GitHub release with all four packages and `checksums.txt`.

Store publication is intentionally separate from package creation. The **Publish Browser Store** workflow downloads the already verified release asset, checks its SHA-256 hash, and then uploads or submits it through the official store mechanism behind a protected GitHub Environment.

See [Multi-browser releases and store publication](docs/MULTI_BROWSER_RELEASES.md) for the exact account, secret, environment, and migration setup.

## Local installation

### Chrome

1. Build the Chrome target.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Select **Load unpacked** and choose `dist/chrome`.

### Microsoft Edge

1. Build the Edge target.
2. Open `edge://extensions`.
3. Enable Developer mode.
4. Select **Load unpacked** and choose `dist/edge`.

### Firefox

1. Build the Firefox target.
2. Open `about:debugging`.
3. Select **This Firefox → Load Temporary Add-on**.
4. Select `dist/firefox/manifest.json`.

Ordinary permanent installation requires Mozilla signing.

### Safari

Build the Safari target and use Safari's temporary web-extension development flow. The generated source package is not an App Store-signed application.

## Security and privacy

The extension:

- Uses Manifest V3 or the browser's compatible Web Extension form.
- Requests only `storage` as a standard extension permission.
- Executes no remote code.
- Includes no runtime npm dependencies.
- Keeps Crossref integrity lookups off until the user explicitly enables them.
- Sends only bounded scholarly identifiers to documented APIs.
- Limits an integrity scan to 50 unique DOI requests and no more than four request starts per second.
- Cancels active and queued integrity requests when disabled, replaced by a newer scan, or navigation begins.
- Omits browser credentials and referrer information from NCBI and Crossref requests.
- Does not send complete page text, citation text, full URLs, search queries, browsing history, account identifiers, or analytics identifiers to the integrity provider.
- Supports a zero-network configuration.
- Uses pinned GitHub Actions and deterministic release inputs.

See [SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md), and the project website for current disclosures.

## Known limitations

Some publisher pages use nonstandard, dynamically loaded, collapsed, or author-year citation structures. Reference-list detection can work even when inline-citation marking or scroll-to-reference cannot be performed safely. False-positive avoidance takes priority over guessing from weak journal-title evidence.

Integrity coverage depends on DOI availability and the formal relationships present in the checked Crossref records. A result saying no known signal was found is not a guarantee that a work is correct or reliable. Deferred, failed, and unresolved checks are not treated as clear.

Representative regression pages include PubMed Central, Europe PMC, Nature, Cell, BMJ, ScienceDirect, Wiley, Sage, Taylor & Francis, Oxford Academic, LWW, and Wikipedia pages. Regressions should be filed with the page URL, browser/version, extension version, expected result, and actual result.

## License

- Code: [GNU AGPL-3.0-or-later](LICENSE-CODE)
- Logo: [CC BY-SA 4.0](LICENSE-LOGO)
