# Identity compatibility during the Notandia rebrand

Notandia was previously distributed as **MDPI Filter**. The rebrand changes the public product identity while preserving released technical identifiers that are required for updates, signatures, settings, or store continuity.

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

Keep the released Gecko add-on ID:

```text
mdpi-filter@mdpi-filter.org
```

This value appears in `platforms/firefox/manifest.json`. Tests and release documentation deliberately enforce it. It is a compatibility identifier and must not be treated as the current public name.

### Runtime storage and messages

Existing storage keys, message names, CSS classes, and internal MDPI-specific identifiers may remain when renaming them could reset preferences, invalidate cached state, or introduce migration risk. New general-purpose code should use neutral Notandia terminology, while existing compatibility keys should be changed only through an explicit, tested migration.

## Safe changes

It is safe and expected to change:

- visible product names and descriptions;
- public repository and issue links;
- package metadata that does not identify an installed extension;
- release filenames;
- temporary build-directory names;
- documentation, reviewer notes, and store metadata.

## Review rule

A pull request must not change a browser extension ID, store Product ID, signing key relationship, or persistent storage namespace merely to remove the previous name. Any such change requires a separate migration proposal documenting existing releases, update behavior, rollback, user-data preservation, and store-specific consequences.
