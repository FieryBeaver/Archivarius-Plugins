#!/usr/bin/env node
// Builds index.json from plugins/*/plugin.json.
//
//   node scripts/build-index.mjs          write index.json
//   node scripts/build-index.mjs --check  validate only; exit 1 if anything is
//                                          wrong or index.json is stale
//
// Plain Node, no dependencies.

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGINS_DIR = join(ROOT, 'plugins')
const INDEX_PATH = join(ROOT, 'index.json')
const MAX_BYTES = 262144 // 256 KB
const CHECK = process.argv.includes('--check')

const REGISTRY = {
  name: 'Archivarius Plugins',
  description: 'Community plugin registry for Archivarius. All plugins are free.',
  homepage: 'https://github.com/FieryBeaver/Archivarius-Plugins',
}

// Order here is the key order written to index.json.
const REQUIRED = {
  slug: 'string',
  name: 'string',
  version: 'string',
  author: 'string',
  blurb: 'string',
  tags: 'array',
  license: 'string',
  file: 'string',
  bytes: 'number',
}
const OPTIONAL = { icon: 'string' }

const errors = []
const fail = (msg) => errors.push(msg)

function typeOf(v) {
  return Array.isArray(v) ? 'array' : typeof v
}

const plugins = []
const dirs = existsSync(PLUGINS_DIR)
  ? readdirSync(PLUGINS_DIR).filter((d) => statSync(join(PLUGINS_DIR, d)).isDirectory()).sort()
  : []

for (const dir of dirs) {
  const where = `plugins/${dir}`
  const manifestPath = join(PLUGINS_DIR, dir, 'plugin.json')
  if (!existsSync(manifestPath)) {
    fail(`${where}: missing plugin.json`)
    continue
  }
  let meta
  try {
    meta = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (e) {
    fail(`${where}/plugin.json: invalid JSON (${e.message})`)
    continue
  }
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    fail(`${where}/plugin.json: must be a JSON object`)
    continue
  }

  let ok = true
  for (const [key, type] of Object.entries(REQUIRED)) {
    if (!(key in meta)) { fail(`${where}/plugin.json: missing required field "${key}"`); ok = false; continue }
    if (typeOf(meta[key]) !== type) { fail(`${where}/plugin.json: "${key}" must be a ${type}`); ok = false; continue }
    if (type === 'string' && !meta[key].trim()) { fail(`${where}/plugin.json: "${key}" must not be empty`); ok = false }
  }
  for (const [key, type] of Object.entries(OPTIONAL)) {
    if (key in meta && typeOf(meta[key]) !== type) { fail(`${where}/plugin.json: "${key}" must be a ${type}`); ok = false }
  }
  for (const key of Object.keys(meta)) {
    if (!(key in REQUIRED) && !(key in OPTIONAL)) fail(`${where}/plugin.json: unknown field "${key}"`)
  }
  if (!ok) continue

  if (meta.slug !== dir) fail(`${where}/plugin.json: slug "${meta.slug}" must match folder name "${dir}"`)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug)) fail(`${where}/plugin.json: slug must be lowercase kebab-case`)
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(meta.version)) fail(`${where}/plugin.json: version must be semver (e.g. 1.0.0)`)
  if (!meta.tags.every((t) => typeof t === 'string' && t.trim())) fail(`${where}/plugin.json: tags must be non-empty strings`)
  const expectedFile = `plugins/${dir}/plugin.html`
  if (meta.file !== expectedFile) fail(`${where}/plugin.json: file must be "${expectedFile}"`)

  const htmlPath = join(ROOT, meta.file)
  if (!existsSync(htmlPath)) {
    fail(`${where}: ${meta.file} does not exist`)
    continue
  }
  const html = readFileSync(htmlPath)
  const size = html.length
  if (size > MAX_BYTES) fail(`${meta.file}: ${size} bytes exceeds the ${MAX_BYTES}-byte (256 KB) limit`)
  if (!/^﻿?\s*<!doctype html>/i.test(html.subarray(0, 512).toString('utf8'))) {
    fail(`${meta.file}: must start with <!doctype html>`)
  }
  if (meta.bytes !== size) fail(`${where}/plugin.json: bytes is ${meta.bytes} but ${meta.file} is ${size} bytes`)

  const entry = {}
  for (const key of [...Object.keys(REQUIRED), ...Object.keys(OPTIONAL)]) {
    if (key in meta) entry[key] = meta[key]
  }
  plugins.push(entry)
}

const output = JSON.stringify({ ...REGISTRY, plugins }, null, 2) + '\n'

if (CHECK) {
  const current = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf8') : null
  if (current !== output) fail('index.json is stale or missing: run `node scripts/build-index.mjs` and commit the result')
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

if (CHECK) {
  console.log(`✓ index.json is up to date (${plugins.length} plugin(s))`)
} else {
  writeFileSync(INDEX_PATH, output)
  console.log(`✓ wrote index.json (${plugins.length} plugin(s))`)
}
