# Multi-browser releases and store publication

This repository is the canonical source for the Notandia browser extension. A single source commit generates isolated packages for Chrome, Microsoft Edge, Firefox, and Safari.

## Release outputs

A tag such as `v0.1.0` creates one GitHub release containing:

- `notandia-chrome-v0.1.0.zip`
- `notandia-edge-v0.1.0.zip`
- `notandia-firefox-source-v0.1.0.zip`
- `notandia-safari-source-v0.1.0.zip`
- `checksums.txt`

The Edge ZIP is directly uploadable. The Chrome ZIP is the checksummed canonical package input: because Verified CRX Uploads are enabled, the protected `store-chrome` workflow signs that ZIP with the registered private key and uploads a generated `.crx`. Firefox and Safari are deliberately labelled `source`: Firefox must be signed by Mozilla, and Safari must be packaged and signed through Apple before ordinary installation.

All four packages use the same runtime files. `platforms/<target>/manifest.json` contains only the target-specific manifest overlay. `store/<target>/` contains store-specific metadata. `platforms/<target>/policy.json` defines terminology that must not appear in that target's package or listing.

## Stable and prerelease versions

GitHub prerelease tags such as `v0.1.0-rc.1` are useful for building and inspecting candidate artifacts. They must not be uploaded to browser stores.

Browser manifests accept numeric versions, so the build converts both `v0.1.0-rc.1` and `v0.1.0` to manifest version `0.1.0`, while preserving the full candidate label only as `version_name` where supported. Uploading the candidate could therefore consume the numeric version needed by the intended stable release.

The **Publish Browser Store** workflow enforces this boundary and accepts only stable numeric tags such as `v0.1.0` or `v0.1.0.1`. Use prerelease tags only for GitHub artifact validation, then create a stable tag after the candidate passes testing.

## Local builds

```bash
npm ci --ignore-scripts
npm test
npm run build
```

The output directories are:

```text
dist/chrome
dist/edge
dist/firefox
dist/safari
```

Build one target and optionally override the release version:

```bash
npm run build:target -- --target edge --version 0.1.0
```

## GitHub Environments

Create these repository environments under **Settings → Environments**:

- `store-chrome`
- `store-edge`
- `store-firefox`

For each environment:

1. Enable **Required reviewers** and select the maintainer account.
2. Prevent administrator bypass if the repository policy allows it.
3. Restrict deployment to the `main` branch. The publication workflow is manually dispatched from `main`; the immutable release tag is supplied as an input and checked out inside the job.
4. Add only the secrets required by that store.

A release tag builds and verifies packages automatically. Store publication is a separate manual workflow so a compromised tag or build cannot immediately publish everywhere.

Run publication from **Actions → Publish Browser Store → Run workflow**. Select the store, provide an existing stable release tag, review the package and checksum, and then choose whether to submit it for review. Prerelease tags are rejected before any credential is used.

## Chrome Web Store setup

The Chrome workflow updates the existing store item through the Chrome Web Store API v2 and supports the item's Verified CRX Uploads requirement. The Notandia rebrand must be published as an update to that item; do not create a replacement listing or change the registered CRX key.

Complete these account-level steps once:

1. Enable two-step verification on the publishing Google account.
2. In Google Cloud Console, create or select a project and enable **Chrome Web Store API**.
3. Configure the OAuth consent screen.
4. Create a Web application OAuth client and add `https://developers.google.com/oauthplayground` as an authorized redirect URI.
5. In OAuth Playground, use the OAuth client and authorize the scope `https://www.googleapis.com/auth/chromewebstore`.
6. Exchange the authorization code and save the refresh token.
7. In the Chrome Web Store developer dashboard, record the publisher ID and extension ID.
8. Complete the Store listing and Privacy tabs. The API cannot replace the required first-time dashboard setup.
9. Keep the exact RSA private key whose public key was registered when Verified CRX Uploads were enabled.

Add these secrets to `store-chrome`:

```text
CHROME_PUBLISHER_ID
CHROME_EXTENSION_ID
CHROME_CLIENT_ID
CHROME_CLIENT_SECRET
CHROME_REFRESH_TOKEN
CHROME_CRX_PRIVATE_KEY_B64
```

Create the base64 value locally without changing the key:

```bash
base64 < privatekey.pem | tr -d '\n'
```

Paste only that output into the `CHROME_CRX_PRIVATE_KEY_B64` environment secret. Never commit the PEM file, paste it into an issue, or store it in the Chrome Web Store account. Keep at least one encrypted offline backup independent of GitHub; losing the key requires Chrome Web Store support and can delay updates.

The workflow reconstructs the key only in the runner's temporary directory with restrictive permissions, validates it with OpenSSL, derives the Chrome extension ID from its public key, and fails if it does not match `CHROME_EXTENSION_ID`. It then signs the checksummed Chrome ZIP with the installed Google Chrome binary, deletes temporary key material, and uploads the resulting CRX with the required raw-upload headers.

With `submit=false`, the workflow signs and uploads the verified CRX but leaves the item unpublished. With `submit=true`, it also requests review/publication.

For the strongest possible separation, keep the signing key entirely offline and sign/upload CRX files manually instead of storing `CHROME_CRX_PRIVATE_KEY_B64` in GitHub. The protected environment approach provides automation while keeping the key outside the Google publisher account and requiring an explicit deployment approval.

## Microsoft Edge Add-ons setup

The Edge workflow updates the existing Partner Center product through the v1.1 API-key flow. The Notandia rebrand must remain on that product so existing users receive the update.

Complete these account-level steps once:

1. Sign in to Partner Center with the account that owns the extension.
2. Open **Microsoft Edge → Publish API**.
3. Enable the new API-key experience.
4. Select **Create API credentials**.
5. Record the Client ID and API key when they are shown.
6. Open the extension overview and record its Product ID GUID.
7. Keep the existing first store submission and listing metadata in Partner Center. The update API cannot create a new product or edit listing metadata.

Add these secrets to `store-edge`:

```text
EDGE_PRODUCT_ID
EDGE_CLIENT_ID
EDGE_API_KEY
```

Optionally add an environment variable named `EDGE_CERTIFICATION_NOTES`. The workflow otherwise uses a conservative default certification note.

The Edge package and its listing are checked for references to competing stores and browser-specific installation pages before a release can be created.

## Firefox Add-ons setup

The Firefox workflow uses Mozilla's official `web-ext` client and the AMO v5 submission API.

Complete these account-level steps once:

1. Create or sign in to the addons.mozilla.org developer account.
2. Open the AMO API credentials page.
3. Generate an API key and secret.
4. Review `store/firefox/amo-metadata.json`, especially the summary, category, license, and reviewer notes.

Add these secrets to `store-firefox`:

```text
AMO_JWT_ISSUER
AMO_JWT_SECRET
```

The generated Firefox manifest retains the released Manifest V3 ID:

```text
mdpi-filter@mdpi-filter.org
```

This is a legacy compatibility identifier, not the public product name. Do not change it: Notandia must update the same signed add-on identity. Firefox publication is always a real AMO submission, so the workflow requires `submit=true`.

See [Identity compatibility](IDENTITY_COMPATIBILITY.md) before changing any extension or store identifier.

## Safari status

The release workflow creates a Safari-compatible source package and removes metadata that Safari does not need. It does not publish to the App Store yet.

Public Safari distribution still requires:

1. Apple Developer Program membership.
2. An App Store Connect app record.
3. A verified physical-device test on current macOS and iOS Safari.
4. Safari Web Extension Packager or Xcode packaging.
5. App Store privacy disclosures, screenshots, signing, and review information.
6. App Store Connect API access and narrowly scoped API credentials before publication automation is enabled.

Until those gates are met, use the Safari source package for local compatibility testing and do not advertise it as an installable App Store release.

## Migrating the dedicated Edge repository

Do not archive `notandia/microsoft-edge` before the first Edge update produced from this repository has passed certification.

Migration sequence:

1. Create and inspect a GitHub-only prerelease tag.
2. Compare the generated Edge ZIP with the existing Edge package without uploading the prerelease to the store.
3. Create a stable numeric release tag after validation.
4. Publish one Edge update through the protected workflow.
5. Confirm installation, updates, permissions, and store listing links.
6. Replace the dedicated repository README with a migration notice pointing to `notandia/browser-extension`.
7. Close or supersede any remaining implementation pull requests in the dedicated repository.
8. Archive the old repository as read-only.

Do not maintain a generated code mirror unless a store reviewer specifically requires it. The store-specific package and metadata are sufficient separation; the runtime source must remain canonical here.

## Release safety properties

- Store packages are built from one source commit.
- Store-specific terms and manifests are generated, not manually copied.
- Actions are pinned to full commit hashes.
- The release workflow publishes only artifacts that passed the test job.
- Store workflows download the existing release artifacts and verify SHA-256 checksums instead of rebuilding.
- Chrome publication converts the verified ZIP into a CRX using the registered signing key and validates that the key matches the configured extension ID.
- Store publication rejects prerelease tags before using provider credentials.
- Each store has separate credentials and a separate protected GitHub Environment.
- Store submission remains independently approvable.
