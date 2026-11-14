import { useTranslation } from "react-i18next";
import { HeartPulse, ExternalLink } from "lucide-react";
import { parseOsdr, osdrStudyUrl } from "../nasa/osdr.ts";
import snapshot from "../data/osdrSnapshot.json";
import { SourceChip, glass } from "./bits.tsx";

// OSDR blocks browser requests (CORS), so this card shows a real NASA answer saved by `npm run osdr`. It is always labelled "not live".
const s = snapshot as { term?: string; total?: number; studies?: { id: string; title: string }[]; fetchedAt?: string };
const data = typeof s.fetchedAt === "string" ? parseOsdr({ hits: { total: s.total, hits: (s.studies ?? []).map(x => ({ _id: x.id, _source: { title: x.title } })) } }, s.term ?? "bone") : null;

/** Real NASA OSDR studies about astronaut health (bones). Hidden until the snapshot has been saved. */
export function OsdrCard() {
  const { t } = useTranslation();
  if (!data) return null;
  return (
    <section className={`${glass} mt-6 p-4`} aria-labelledby="osdr-h">
      <h2 id="osdr-h" className="flex items-center gap-2 font-head text-xl font-extrabold"><HeartPulse aria-hidden className="h-5 w-5 text-rose-300" />{t("osdr.title")}</h2>
      <p className="mt-1 text-slate-100">{t("osdr.count", { n: data.total.toLocaleString() })}</p>
      <p className="mt-1 text-sm text-slate-300">{t("osdr.why")}</p>
      {data.studies.length > 0 && <ul className="mt-2 space-y-1.5">{data.studies.map(x => <li key={x.id}><a className="inline-flex items-start gap-1.5 text-sm text-cyan-300 underline" href={osdrStudyUrl(x.id)} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{x.id}: {x.title}</span></a></li>)}</ul>}
      <p className="mt-2 text-xs text-slate-400">{t("osdr.saved", { date: s.fetchedAt })}</p>
      <div className="mt-2"><SourceChip id="osdr" label={t("common.source")} /></div>
    </section>
  );
}
