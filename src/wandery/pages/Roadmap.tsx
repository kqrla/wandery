import Shell, { Display, Eyebrow, Lead } from "./Shell";

type Status = "shipped" | "in-progress" | "next" | "later";

type Entry = {
  status: Status;
  label: string; // e.g. "shipped · q1", "in progress", "next"
  title: string;
  bullets: string[];
};

const ENTRIES: Entry[] = [
  {
    status: "shipped",
    label: "shipped · q1",
    title: "first atlas, first borders",
    bullets: [
      "world, europe, asia, africa, oceania, americas, mena views",
      "country subdivisions for canada + united states",
      "soft cartographic theme — cherry, thistle, powder",
      "english-only country labels rendered from geojson",
    ],
  },
  {
    status: "shipped",
    label: "shipped · q2",
    title: "filters, panels, and the dial",
    bullets: [
      "filter chips — political blocs, alliances, linguistic regions",
      "country panel with capitals, languages, neighbours",
      "timeline reel — rotary-style year dial, not a slider",
      "right-side info drawer for selected regions",
    ],
  },
  {
    status: "in-progress",
    label: "in progress",
    title: "linguistic + cultural overlays",
    bullets: [
      "francophone, arabic, slavic, sino-tibetan, dravinian regions",
      "religious geography as gentle, translucent strata",
      "diaspora corridors — movement, not territory",
      "cultural pathways: trade, migration, linguistic spread",
    ],
  },
  {
    status: "in-progress",
    label: "in progress",
    title: "timeline reconstructions",
    bullets: [
      "european borders for 1914, 1945, 1991 as switchable states",
      "cold-war europe: iron curtain, warsaw pact, comecon",
      "ottoman extent across the long 19th century",
      "colonial africa — 1885 berlin partition vs present sovereignty",
    ],
  },
  {
    status: "next",
    label: "next",
    title: "digital passport + stamp collections",
    bullets: [
      "personal atlas booklet of explored regions, eras, concepts",
      "conceptual stamps: schengen, silk road, baltics, the alps",
      "fictional boarding passes — western europe → eastern bloc, 1987",
      "curated sets: post-soviet archive, maritime nations, former empires",
    ],
  },
  {
    status: "later",
    label: "later",
    title: "experimental atlas tools",
    bullets: [
      "compare mode — europe 1914 vs 2025, nato over time",
      "community archives: understanding the balkans, railways of europe",
      "paper-map overlays — historical atlas scans beneath live tiles",
      "audio rooms — wind across the steppe, a port at dawn",
    ],
  },
];

const dotColor = (s: Status) =>
  s === "shipped"
    ? "bg-[hsl(var(--lib-color))]"
    : s === "in-progress"
      ? "bg-[hsl(var(--uni-color))]"
      : s === "next"
        ? "bg-[hsl(var(--make-color))]"
        : "bg-border";

export default function Roadmap() {
  return (
    <Shell active="roadmap">
      <Eyebrow>roadmap · catalogue of forthcoming systems</Eyebrow>
      <Display>future atlas expansions.</Display>
      <Lead>
        a quiet catalogue, not a product roadmap. each entry is something we are
        slowly drafting into the atlas, when it is ready and not before.
      </Lead>

      <div className="relative pl-10 md:pl-14">
        {/* dashed vertical rail */}
        <div
          aria-hidden
          className="absolute left-[10px] md:left-[14px] top-2 bottom-2 w-px"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, hsl(var(--border)) 0 6px, transparent 6px 12px)",
            backgroundSize: "1px 12px",
            backgroundRepeat: "repeat-y",
          }}
        />
        <ol className="space-y-14">
          {ENTRIES.map((e, i) => (
            <li key={i} className="relative">
              {/* dot */}
              <span
                className={`absolute -left-[34px] md:-left-[42px] top-[6px] h-3 w-3 rounded-full ring-4 ring-background ${dotColor(e.status)}`}
              />
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">
                {e.label}
              </div>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-5 leading-tight">
                {e.title}
              </h3>
              <ul className="space-y-2.5">
                {e.bullets.map(b => (
                  <li
                    key={b}
                    className="text-[14px] text-foreground/80 leading-relaxed flex gap-3"
                  >
                    <span className="text-muted-foreground/70 select-none">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}