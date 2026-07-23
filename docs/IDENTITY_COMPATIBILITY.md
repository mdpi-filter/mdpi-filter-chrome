# Identity and compatibility during the Notandia rebrand

Chrome and Microsoft Edge were previously distributed as **MDPI Filter**. Firefox has not yet been released. The rebrand changes the public product identity while preserving only technical identifiers that are actually required for existing update, signature, settings, or store continuity.

## Public identity

New user-facing material should use **Notandia**, including:

- manifest and toolbar names;
- popup and options-page titles;
- browser-store titles, summaries, screenshots, and descriptions;
- release-asset filenames;
- documentation and support links;
- website and repository presentation.

Feature descriptions may still use **MDPI** when referring specifically to detection of MDPI publications, domains, DOI prefixes, citations, tags, or results. That is functional terminology, not the product name.

## Identifiers that must remain stable

### Chrome

Keep the existing Chrome Web Store item, extension ID, and registered CRX signing key. Changing the key or publishing a replacement item would interrupt the existing update path.

### Microsoft Edge

Keep the existing Microsoft Edge Add-ons product and extension identity. Publish the Notandia package as an update to that product.

### Firefox

Firefox has not been published, signed, or distributed through AMO. Its pre-release Gecko ID was therefore changed before the first submission to:

```text
browser-extension@notandia.github.io
```

This identifier should become stable only after the first signed or listed Firefox release. Until then, do not describe it as a released compatibility identity.

### Runtime storage and messages

Existing storage keys, message names, CSS classes, and internal MDPI-specific identifiers may remain when renaming them could reset preferences, invalidate cached state, or introduce migration risk for released Chrome or Edge users. New general-purpose code should use neutral Notandia terminology. Existing compatibility keys should be changed only through an explicit, tested migration.

## Safe changes

It is safe and expected to change:

- visible product names and descriptions;
- public repository and issue links;
- package metadata that does not identify an installed released extension;
- unreleased Firefox identifiers before first signing or publication;
- release filenames;
- temporary build-directory names;
- documentation, reviewer notes, and store metadata.

## Review rule

A pull request must not change an identifier that already controls updates for a released Chrome or Edge installation, a store Product ID, a signing-key relationship, or a persistent storage namespace merely to remove the previous name. Any such change requires a separate migration proposal documenting existing releases, update behavior, rollback, user-data preservation, and store-specific consequences.
