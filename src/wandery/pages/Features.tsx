import Shell, { Display, Eyebrow, Lead } from "./Shell";
import { FILTERS } from "@/wandery/data/filters";

interface Card {
  eyebrow: string;
  title: string;
  body: string;
  swatches: string[];     // filter ids — used purely as visual tints
}

const CARDS: Card[] = [
  { eyebrow: "system 01", title: "interactive world atlas",
    body: "a single uninterrupted canvas. pale tiles, soft labels, no clutter. the chrome floats. you move through geography the way you would through an exhibit.",
    swatches: ["eu","nato","anglosphere"] },
  { eyebrow: "system 02", title: "regional exploration modes",
    body: "europe, the americas, asia, africa, oceania — each opens with its own quiet vocabulary of filters and a centred view that respects the shape of the place.",
    swatches: ["balkans","scandinavia","baltics"] },
  { eyebrow: "system 03", title: "geopolitical overlays",
    body: "translucent watercolour washes for blocs, unions and alliances. stack as many as you want. overlapping regions softly blend into mauve and dusk.",
    swatches: ["eu","nato","schengen"] },
  { eyebrow: "system 04", title: "historical timeline scrubbing",
    body: "a dial from 1800 to the present. years move; borders, naming and affiliations breathe with them. the past does not snap into place — it dissolves in.",
    swatches: ["postsoviet","formeryugoslavia","mediterranean"] },
  { eyebrow: "system 05", title: "alliance visualization",
    body: "see who stands with whom — nato, eu, brics, g20, commonwealth — as soft civic colour rather than as a list.",
    swatches: ["nato","brics","g20"] },
  { eyebrow: "system 06", title: "linguistic region layers",
    body: "francophone, arab world, slavic, nordic. language lives on top of, not inside, the political map.",
    swatches: ["francophone","arabworld","slavic","nordic"] },
  { eyebrow: "system 07", title: "historical border reconstruction",
    body: "europe 1914. cold-war europe. the ottoman extent. visualised as drifting overlays rather than aggressive recolourings.",
    swatches: ["formeryugoslavia","postsoviet","mediterranean"] },
  { eyebrow: "system 08", title: "identity & affiliation mapping",
    body: "each country becomes a small archival card: its blocs, its languages, its neighbours, the eras that shaped it.",
    swatches: ["commonwealth","eu","democracies"] },
  { eyebrow: "system 09", title: "archival map exploration",
    body: "future-loaded: scans of paper atlases, ottoman, soviet, hanseatic. wandery is built so these can drop in as quiet additional layers.",
    swatches: ["islandnations","landlocked","globalsouth"] },
  { eyebrow: "system 10", title: "conflict perspective atlas",
    body: "a dedicated /conflicts index of contested regions. each card opens a map that swaps names, borders and legends to match whichever side of the dispute you're reading from.",
    swatches: ["nato","postsoviet","arabworld"] },
  { eyebrow: "system 11", title: "legal systems filter",
    body: "common law, civil law, religious, customary — nested into sub-traditions (napoleonic, germanic, sharia, halakha). hybrid jurisdictions render as the literal blend of their parent hues.",
    swatches: ["commonwealth","francophone","arabworld"] },
  { eyebrow: "system 12", title: "cross-linked tag spotlight",
    body: "click a tag inside any country card and the map lights up everyone else who carries it. toggle back to a tidy list view at any time. tags chain — language, religion, bloc, era.",
    swatches: ["francophone","slavic","nordic"] },
  { eyebrow: "system 13", title: "country-level sub-atlases",
    body: "the united states, canada, the united kingdom, australia, new zealand each open as their own surface — states, provinces, devolved nations and overseas territories included.",
    swatches: ["anglosphere","commonwealth","g20"] },
];

export default function Features() {
  return (
    <Shell active="features">
      <Eyebrow>features · index</Eyebrow>
      <Display>the systems inside the atlas.</Display>
      <Lead>
        nine quiet systems that, together, make wandery feel less like software
        and more like a room in a small civic museum.
      </Lead>

      <div className="space-y-16 mt-4">
        {CARDS.map((c, i) => (
          <article key={i} className="grid md:grid-cols-[1fr,1.4fr] gap-8 items-start">
            {/* preview panel — atmospheric, abstract */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 shadow-sm bg-card/40 backdrop-blur-md">
              <div className="absolute inset-0" style={{
                background:
                  "radial-gradient(70% 50% at 30% 30%, rgba(230,210,220,0.45), transparent 70%)," +
                  "radial-gradient(60% 50% at 80% 70%, rgba(245,225,210,0.45), transparent 72%)," +
                  "linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)))",
              }} />
              {c.swatches.map((id, j) => {
                const f = FILTERS[id];
                if (!f) return null;
                return (
                  <span key={j} className="absolute rounded-full" style={{
                    top: `${15 + j * 22}%`, left: `${20 + j * 14}%`,
                    width: `${110 - j * 10}px`, height: `${110 - j * 10}px`,
                    background: `rgba(${f.color} / 0.32)`,
                    filter: "blur(18px)",
                  }} />
                );
              })}
              <div className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{c.eyebrow}</div>
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                {c.swatches.map(id => {
                  const f = FILTERS[id];
                  if (!f) return null;
                  return (
                    <span key={id} className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-border/60"
                      style={{ background: `rgba(${f.color} / 0.32)`, color: "hsl(var(--foreground) / 0.85)" }}>
                      {f.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{c.eyebrow}</div>
              <h3 className="font-serif text-3xl leading-tight text-foreground mb-3">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-foreground/80 max-w-prose">{c.body}</p>
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}