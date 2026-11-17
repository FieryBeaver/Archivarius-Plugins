# Contributing a plugin

Thanks for sharing your plugin. Before you start writing, read the
[Archivarius plugin author guide (PLUGINS.md)](https://github.com/FieryBeaver/Archivarius/blob/main/PLUGINS.md).

## Steps

1. Fork this repo and create a branch.
2. Create `plugins/<slug>/`, where `<slug>` is lowercase kebab-case (`initiative-tracker`).
3. Add `plugins/<slug>/plugin.html` and `plugins/<slug>/plugin.json` (the fields are listed in the [README](README.md#pluginjson)).
4. Run `node scripts/build-index.mjs`. It checks your plugin and regenerates `index.json`.
5. Commit `plugins/<slug>/` together with the updated `index.json`, then open a pull request.

## PR checklist

Copy this into your pull request description:

```
- [ ] Self-contained single HTML file at plugins/<slug>/plugin.html (CSS and JS inline, images as data: URLs or SVG)
- [ ] File starts with <!doctype html>
- [ ] File is 256 KB (262144 bytes) or less
- [ ] No external network requests (no CDN scripts, web fonts, fetch or remote images)
- [ ] Works in the sandbox: no localStorage/cookies/alert/popups, all state goes through archivarius:set-data
- [ ] Free/open license declared in plugin.json (and third-party content attributed inside the file)
- [ ] plugin.json filled in: slug (= folder name), name, version, author, blurb, tags, license, file, bytes (icon optional)
- [ ] Optional: screenshot at plugins/<slug>/screenshot.png
- [ ] Ran `node scripts/build-index.mjs` and committed the updated index.json
```

## Updating a plugin

Change `plugin.html`, bump `version` in `plugin.json`, then run
`node scripts/build-index.mjs`. It tells you the new byte size to put in
`bytes`. Run it again and commit.

## Review

CI runs `node scripts/build-index.mjs --check` on every pull request. It fails
when a manifest field is missing or invalid, when `bytes` doesn't match the
file, when a file is over 256 KB or doesn't start with `<!doctype html>`, or
when `index.json` is stale. A maintainer then reads the plugin code before
merging. Plugins that phone home, obfuscate code, or aren't freely licensed
won't be merged.
