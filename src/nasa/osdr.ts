// NASA OSDR (Open Science Data Repository) search: real published space-biology and astronaut-health studies.
// The OSDR server does not allow browsers to read its answers (CORS), so `npm run osdr` saves an answer from the terminal
// and the game shows that saved copy, labelled "not live". parseOsdr checks that answer before anything is shown.
export interface OsdrStudy { id: string; title: string }
export interface OsdrData { term: string; total: number; studies: OsdrStudy[] }
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
export const osdrStudyUrl = (id: string) => `https://osdr.nasa.gov/bio/repo/data/studies/${id}`;
export const osdrSearchUrl = (term: string, size = 3) => `https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(term)}&from=0&size=${size}&type=cgene`;
const text = (x: unknown) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "");
/**
 * Never trust the network. Accepts the Elasticsearch-style answer {hits:{total, hits:[{_id,_source}]}}; the total may be a number or {value}.
 * A study is kept only with an OSD-number and a title. Without a usable total nothing is shown (null).
 */
export function parseOsdr(j: unknown, term: string): OsdrData | null {
  if (!isObj(j) || !isObj(j.hits)) return null;
  const t = j.hits.total, total = typeof t === "number" ? t : isObj(t) && typeof t.value === "number" ? t.value : NaN;
  if (!Number.isFinite(total) || total < 0) return null;
  const rows = Array.isArray(j.hits.hits) ? j.hits.hits : [];
  const studies = rows.flatMap((r): OsdrStudy[] => {
    if (!isObj(r)) return [];
    const s = isObj(r._source) ? r._source : {};
    const id = [r._id, s.Accession, s.accession, s["Study Identifier"]].map(text).find(v => /^OSD-\d+$/.test(v));
    const title = [s["Study Title"], s.title, s["Project Title"], s.Title].map(text).find(Boolean);
    return id && title ? [{ id, title: title.length > 140 ? title.slice(0, 137) + "…" : title }] : [];
  });
  return { term, total, studies: studies.slice(0, 3) };
}
