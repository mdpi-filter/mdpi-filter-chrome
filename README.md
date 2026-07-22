# MDPI Filter browser extension

**MDPI Filter** identifies MDPI publications in literature searches and scholarly references. This repository is the canonical browser-extension source for Chrome, Microsoft Edge, Firefox, and Safari.

## Browser outputs

| Target | Generated release asset | Distribution status |
|---|---|---|
| Chrome | `mdpi-filter-chrome-vX.Y.Z.zip` | Uploadable to Chrome Web Store |
| Microsoft Edge | `mdpi-filter-edge-vX.Y.Z.zip` | Uploadable to Microsoft Edge Add-ons |
| Firefox | `mdpi-filter-firefox-source-vX.Y.Z.zip` | Submitted to AMO for Mozilla signing |
| Safari | `mdpi-filter-safari-source-vX.Y.Z.zip` | Local compatibility source; App Store publication deferred |

All packages are generated from the same source commit. Browser-specific manifests, store metadata, terminology restrictions, and credentials remain isolated.

## Features

- Hide or highlight MDPI results on Google, Google Scholar, PubMed, and Europe PMC.
- Mark MDPI entries in reference lists.
- Mark related inline numerical citations where page structure permits.
- Identify MDPI entries in cited-by and similar-article sections.
- Show detected references in the toolbar popup and scroll to a selected reference.
- Resolve PMID and PMCID identifiers through NCBI when direct DOI evidence is unavailable.
- Disable all optional network detection through the extension preference.

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

- Uses Manifest V3.
- Requests only `storage` as an extension permission.
- Executes no remote code.
- Includes no runtime npm dependencies.
- Sends only bounded scholarly identifiers to documented APIs when network detection is enabled.
- Omits credentials and referrer information from NCBI requests.
- Supports a zero-network mode.
- Uses pinned GitHub Actions and deterministic release inputs.

See [SECURITY.md](SECURITY.md) and the project website for current disclosures.

## Known limitations

Some publisher pages use nonstandard, dynamically loaded, collapsed, or author-year citation structures. Reference-list detection can work even when inline-citation marking or scroll-to-reference cannot be performed safely. False-positive avoidance takes priority over guessing from weak journal-title evidence.

Representative regression pages include PubMed Central, Europe PMC, Nature, Cell, BMJ, ScienceDirect, Wiley, Sage, Taylor & Francis, Oxford Academic, LWW, and Wikipedia pages. Regressions should be filed with the page URL, browser/version, extension version, expected result, and actual result.

## License

- Code: [GNU AGPL-3.0-or-later](LICENSE-CODE)
- Logo: [CC BY-SA 4.0](LICENSE-LOGO)
