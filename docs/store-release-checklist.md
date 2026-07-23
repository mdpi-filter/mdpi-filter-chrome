# Multi-browser store release checklist

The `0.1.0` research-integrity preview must not receive a stable release tag or be submitted to any browser store until every applicable item is evidenced.

## Package and provenance

- [ ] Use packages produced by the successful GitHub Actions run for the exact release commit.
- [ ] Record the commit SHA, workflow run, artifact checksums, manifest versions, and package sizes.
- [ ] Verify ZIP integrity and confirm there are no untracked or unexpected generated runtime files.
- [ ] Retain the previous Chrome and Edge store packages and rollback instructions.
- [ ] Compare the canonical Edge package with the currently published Edge package before replacing the old repository workflow.

## Privacy and listing disclosure

- [ ] Confirm the public Chrome, Edge, Firefox, and Safari privacy-policy URLs load successfully.
- [ ] Update the Chrome Web Store privacy form to disclose the optional DOI/website-content transmission.
- [ ] Update the Microsoft Edge listing and privacy declarations with the same description.
- [ ] Confirm the Firefox listing exposes the privacy policy and Mozilla's optional `websiteContent` consent prompt.
- [ ] State consistently that only normalized DOI identifiers are sent to Crossref for scholarly metadata and post-publication status lookup.
- [ ] State consistently that page/article text, citation text, full URLs, search queries, browsing history, cookies, account identifiers, and analytics identifiers are not sent.
- [ ] Confirm the declared purpose is single-purpose functionality, not advertising, profiling, sale, credit assessment, or unrelated transfer.

## Runtime evidence

Perform the checks in current Chrome, Edge, and Firefox builds. Repeat Safari checks before any App Store submission.

- [ ] With integrity lookups disabled, confirm zero Crossref requests occur, including after navigation and DOM mutations.
- [ ] Enable lookups and inspect traffic on retraction, concern, correction, reinstatement, duplicate-publication, clean, unresolved, and more-than-50-DOI fixtures.
- [ ] Confirm every Crossref request contains only the DOI in the endpoint and sends no cookies or referrer.
- [ ] Confirm request starts remain at or below four per second.
- [ ] Disable lookups during an active scan and confirm queued and in-flight requests stop.
- [ ] In Firefox, deny the optional data permission and confirm no Crossref request occurs; grant it and confirm lookups work.
- [ ] Confirm deferred, unresolved, not-found, and failed records are never labeled safe or clear.
- [ ] Confirm toolbar badge counts affected works once, not individual notices.
- [ ] Confirm reinstatement supersedes an older retraction while preserving the event history.
- [ ] Confirm existing MDPI detection still works when no integrity signal is present.

## Accessibility and presentation

- [ ] Verify each status has icon, text, and color; color is not the sole signal.
- [ ] Verify keyboard navigation, focus visibility, screen-reader labels, light mode, and dark mode.
- [ ] Capture store screenshots showing opt-in controls, counters, event chronology/provenance, and coverage limitations.
- [ ] Update release notes with limitations, Crossref/Retraction Watch attribution, and the opt-in privacy model.

## Store sequence

- [ ] Create the stable tag only after all checks above pass.
- [ ] Upload Chrome with `submit=false`; inspect the signed CRX draft and store declarations.
- [ ] Upload Edge with `submit=false`; inspect the draft and certification notes.
- [ ] Submit Chrome and Edge only after both drafts match the tested artifacts.
- [ ] Submit Firefox with `submit=true` only after reviewing the generated source package and listing metadata; AMO has no equivalent useful draft-only step in this workflow.
- [ ] Keep Safari source-only until Apple signing, device testing, App Store metadata, and review prerequisites are complete.
- [ ] Keep the dedicated Edge repository available until the canonical Edge update passes certification.

## Rollout and monitoring

- [ ] Use the smallest supported staged rollout for Chrome and Edge.
- [ ] Monitor only store-provided aggregate diagnostics and user reports; do not add product analytics.
- [ ] Expand rollout only after checking errors, permission-denial behavior, and false-positive reports.
- [ ] Stop or roll back if privacy behavior, request load, compatibility, or status classification differs from the validated artifact.
