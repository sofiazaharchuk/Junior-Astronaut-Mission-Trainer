import assert from "node:assert/strict";
import { parseOsdr, osdrStudyUrl, osdrSearchUrl } from "../src/nasa/osdr.ts";
// Synthetic fixture in the Elasticsearch-style shape (NOT real studies; used only to test parsing).
const fx = { hits: { total: { value: 123 }, hits: [
  { _id: "OSD-1", _source: { "Study Title": "  Bone   test A " } }, { _id: "bad", _source: { title: "no id" } }, { _id: "OSD-2", _source: {} }, null,
  { _id: "OSD-3", _source: { title: "x".repeat(200) } }, { _id: "OSD-4", _source: { title: "B" } }, { _id: "OSD-5", _source: { title: "C" } }] } };
const d = parseOsdr(fx, "bone")!;
assert.equal(d.total, 123); assert.equal(d.studies.length, 3, "only 3 studies, malformed rows dropped");
assert.equal(d.studies[0].title, "Bone test A"); assert.ok(d.studies[1].title.length <= 140);
assert.equal(parseOsdr({ hits: { total: 7, hits: [] } }, "bone")?.total, 7);
for (const bad of [null, [], {}, { hits: {} }, { hits: { total: "many" } }, { hits: { total: -1 } }]) assert.equal(parseOsdr(bad, "bone"), null, "unexpected shapes give null");
assert.equal(osdrStudyUrl("OSD-1"), "https://osdr.nasa.gov/bio/repo/data/studies/OSD-1");
assert.ok(osdrSearchUrl("bone").startsWith("https://osdr.nasa.gov/osdr/data/search?term=bone"));
// the saved snapshot is either empty (before `npm run osdr`) or must pass the same check as a live answer
import { readFileSync as rf } from "node:fs";
const snap = JSON.parse(rf(new URL("../src/data/osdrSnapshot.json", import.meta.url), "utf8"));
if (snap.fetchedAt) { assert.match(snap.fetchedAt, /^\d{4}-\d{2}-\d{2}$/); assert.ok(parseOsdr({ hits: { total: snap.total, hits: snap.studies.map((x: any) => ({ _id: x.id, _source: { title: x.title } })) } }, snap.term), "snapshot is valid"); }
// photos: every theme in the game must be a known downloader theme, and no two places share a theme by accident
import { readFileSync } from "node:fs";
import { LEVEL_THEME } from "../src/data/themes.ts";
import { FACTS } from "../src/data/facts.ts";
const dl = readFileSync(new URL("../tools/download_photos.mjs", import.meta.url), "utf8");
const themes = new Set([...dl.matchAll(/^\s+([a-z_]+): \[/gm)].map(m => m[1]));
const used = [...Object.values(LEVEL_THEME), ...FACTS.map(f => f.theme)];
for (const t of used) assert.ok(themes.has(t), `photo theme ${t} must exist in tools/download_photos.mjs`);
assert.equal(new Set(used).size, used.length, "levels and facts never share a photo theme");
for (const t of ["solar_storm", "moon_night", "s_apollo", "s_earth", "s_sun", "s_mars", "s_iss", "s_nebula"]) assert.ok(themes.has(t), t);
console.log("osdr + photo theme tests passed");
