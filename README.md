# Archivarius Plugins

The free, community plugin registry for **[Archivarius](https://github.com/FieryBeaver/Archivarius)**, a worldbuilding app.

- **App:** https://archivarius.pages.dev
- **App source:** https://github.com/FieryBeaver/Archivarius
- **Plugin author guide:** [PLUGINS.md](https://github.com/FieryBeaver/Archivarius/blob/main/PLUGINS.md)

Every plugin here is free and open-licensed.

## What a plugin is

An Archivarius plugin is a single self-contained `.html` file (256 KB max) with
its CSS and JavaScript inline. It runs inside an iframe with
`sandbox="allow-scripts"` only. The frame has an opaque origin, no storage, no
cookies, no popups and no access to the app. You can insert a plugin into a
page as a block (from the editor's `/` menu) or open it as a whole page tab.
The only way it talks to Archivarius is `postMessage`. It sends
`archivarius:ready`, and the host replies with
`archivarius:init { data, canEdit, role, theme }`. After that the plugin saves
its whole state with `archivarius:set-data { data }`, sets its height with
`archivarius:resize { height }` and can open another page with
`archivarius:open-page { pageId }`. The full bridge, lifecycle, theming and
data limits are in the **[author guide](https://github.com/FieryBeaver/Archivarius/blob/main/PLUGINS.md)**.

## Plugins

| Plugin | Description | License |
|---|---|---|
| [Daggerheart Sheet](plugins/daggerheart-sheet) | A full Daggerheart SRD 2.0 player sheet: traits, tracks, downtime guides, weapons, heritage/class and domain cards with trackers, drag-reorder and resize. | DPCGL content / MIT code |

## Installing a plugin

In Archivarius, open **Settings → Plugins** and go to the market (provider)
section. This registry is the built-in provider. Browse the list and install
the plugin you want. Only project owners can install plugins. After that,
insert it into any page from the editor's `/` menu, or add it as a page tab
(**+ → Plugin tab…**).

You can also download a `plugin.html` from this repo and upload it by hand in
**Settings → Plugins**.

## Submitting a plugin

1. Fork this repository.
2. Add `plugins/<slug>/plugin.html` (your plugin) and `plugins/<slug>/plugin.json` (its manifest; see below). A `screenshot.png` is optional.
3. Run `node scripts/build-index.mjs` to regenerate `index.json`, then commit everything.
4. Open a pull request.

Rules:

- **Free and open-licensed.** No paid or license-key plugins. Declare the license in `plugin.json` (and in the file if it ships third-party content).
- **256 KB max**, one self-contained HTML file starting with `<!doctype html>`.
- **No external network requests.** The sandbox doesn't guarantee them and the registry doesn't accept them.
- **Reviewed before merge.** A maintainer reads every plugin before it lands. CI checks the manifest, the size and that the index is up to date.

The full checklist is in [CONTRIBUTING.md](CONTRIBUTING.md).

### plugin.json

```json
{
  "slug": "daggerheart-sheet",
  "name": "Daggerheart Sheet",
  "version": "1.0.0",
  "author": "FieryBeaver",
  "blurb": "One or two sentences shown in the market.",
  "tags": ["ttrpg", "daggerheart", "character-sheet"],
  "license": "DPCGL content / MIT code",
  "file": "plugins/daggerheart-sheet/plugin.html",
  "bytes": 174437,
  "icon": "gi:GiDaggers"
}
```

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | Lowercase kebab-case. Must match the folder name. |
| `name` | yes | Display name. |
| `version` | yes | Semver (`1.0.0`). Bump it whenever `plugin.html` changes. |
| `author` | yes | Your name or handle. |
| `blurb` | yes | Short description for the market listing. |
| `tags` | yes | Array of strings. |
| `license` | yes | Must be a free/open license. |
| `file` | yes | Always `plugins/<slug>/plugin.html`. |
| `bytes` | yes | Exact byte size of `plugin.html`. The build script tells you if it doesn't match. |
| `icon` | no | Icon id for the app, e.g. `gi:GiDaggers`. |

## Registry format (providers)

Archivarius reads plugins from **providers**. A provider is any URL that serves
an `index.json` in the format below. This repo is the default provider, and
anyone can host an alternative registry with the same format. Users add it in
**Settings → Plugins** by pasting the provider URL.

This registry's provider URL:

```
https://raw.githubusercontent.com/FieryBeaver/Archivarius-Plugins/main/index.json
```

Every relative path in `index.json` (such as `file`) resolves against the
directory of the `index.json` URL. With the URL above,
`plugins/daggerheart-sheet/plugin.html` resolves to
`https://raw.githubusercontent.com/FieryBeaver/Archivarius-Plugins/main/plugins/daggerheart-sheet/plugin.html`.
A CDN mirror works too, for example
`https://cdn.jsdelivr.net/gh/FieryBeaver/Archivarius-Plugins@main/index.json`.

```json
{
  "name": "Archivarius Plugins",
  "description": "Community plugin registry for Archivarius. All plugins are free.",
  "homepage": "https://github.com/FieryBeaver/Archivarius-Plugins",
  "plugins": [
    {
      "slug": "daggerheart-sheet",
      "name": "Daggerheart Sheet",
      "version": "1.0.0",
      "author": "FieryBeaver",
      "blurb": "…",
      "tags": ["ttrpg", "daggerheart", "character-sheet"],
      "license": "DPCGL content / MIT code",
      "file": "plugins/daggerheart-sheet/plugin.html",
      "bytes": 174437,
      "icon": "gi:GiDaggers"
    }
  ]
}
```

- Top level: `name`, `description`, `homepage` and `plugins` (an array).
- Each plugin entry has the same fields as `plugin.json` above.
- `file` can be relative (resolved against the index URL's directory) or absolute.
- `bytes` is the exact size of the file. Keep each file at 256 KB or less.
- Serve the files with CORS enabled (`Access-Control-Allow-Origin: *`). GitHub raw, jsDelivr and GitHub Pages already do this.

In this repo, `index.json` is generated: `node scripts/build-index.mjs`
collects every `plugins/*/plugin.json` and checks it. Don't edit
`index.json` by hand.

## License

The registry scaffolding (scripts, workflows, docs) is [MIT](LICENSE). Each
plugin uses the license declared in its `plugin.json`.

The Daggerheart Sheet includes material from the Daggerheart SRD under the
Darrington Press Community Gaming License. Its attribution is inside the
plugin file.
