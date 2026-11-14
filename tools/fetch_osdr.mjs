// Saves a real answer of the NASA OSDR search into src/data/osdrSnapshot.json (needs internet, no key).
// Why a tool: OSDR does not allow browsers to read its answers (CORS), so the game cannot ask it live.
// The game shows this file as "From NASA records saved on <date>, not live".
// Run:  npm run osdr
import { writeFileSync } from "node:fs";
import { parseOsdr, osdrSearchUrl } from "../src/nasa/osdr.ts";
import { getRetry } from "./_net.mjs";
const term = "bone";
const res = await getRetry(osdrSearchUrl(term, 3));
const raw = await res.text();
let json = null;
try { json = JSON.parse(raw); } catch { /* handled below */ }
const data = parseOsdr(json, term);
if (!data) {
  console.log("OSDR answered in a shape the game does not understand. Nothing saved. Send this start of the answer to the developer:\n");
  console.log(raw.slice(0, 1500));
  process.exit(1);
}
writeFileSync("src/data/osdrSnapshot.json", JSON.stringify({ ...data, fetchedAt: new Date().toISOString().slice(0, 10) }, null, 2));
console.log(`Saved: ${data.total} studies about "${term}", ${data.studies.length} with links, date ${new Date().toISOString().slice(0, 10)}.`);
