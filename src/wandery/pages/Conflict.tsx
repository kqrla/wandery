import { useMemo, useState } from "react";
import Atlas from "./Atlas";
import { REGIONS } from "@/wandery/data/regions";

export interface ConflictDef {
  id: string;
  label: string;
  blurb: string;
  center: [number, number];
  zoom: number;
  /** ISO codes of the parties tangled in the dispute */
  parties: string[];
  /** ISO codes of outside powers backing a side ("primary ally") */
  allies?: string[];
  perspectives: Array<{
    id: string;
    label: string;
    /** iso → name override applied to labels + tooltips */
    overrides: Record<string, string>;
  }>;
}

export const CONFLICTS: Record<string, ConflictDef> = {
  kashmir: {
    id: "kashmir", label: "kashmir",
    blurb: "a valley claimed by three states; the border depends on the page.",
    center: [34, 76], zoom: 6,
    parties: ["IND","PAK","CHN"],
    perspectives: [
      { id: "india", label: "india perspective", overrides: {
        IND: "India (incl. J&K)", PAK: "Pakistan-Occupied Kashmir",
      }},
      { id: "pakistan", label: "pakistan perspective", overrides: {
        PAK: "Pakistan (incl. Azad Kashmir)", IND: "India (Indian-Occupied Kashmir)",
      }},
      { id: "neutral", label: "neutral cartography", overrides: {
        IND: "India", PAK: "Pakistan",
      }},
    ],
  },
  palestine: {
    id: "palestine", label: "palestine · israel",
    blurb: "the same coastline, named twice. the dial swaps the legend.",
    center: [31.5, 35], zoom: 7,
    parties: ["ISR","PSE"],
    allies: ["USA"],
    perspectives: [
      { id: "arab", label: "arab perspective", overrides: {
        ISR: "Palestine (1948 borders)", PSE: "Palestine",
      }},
      { id: "imperial", label: "imperial / western perspective", overrides: {
        ISR: "Israel", PSE: "West Bank & Gaza",
      }},
      { id: "neutral", label: "neutral cartography", overrides: {
        ISR: "Israel · Palestine", PSE: "Palestinian Territories",
      }},
    ],
  },
  taiwan: {
    id:"taiwan", label:"taiwan strait", blurb:"a province on one map, a republic on the other.",
    center:[24, 121], zoom:6, parties:["CHN","TWN"], allies:["USA"],
    perspectives:[
      { id:"prc", label:"prc perspective", overrides:{ TWN:"Taiwan Province (PRC)" } },
      { id:"roc", label:"taiwan perspective", overrides:{ TWN:"Republic of China (Taiwan)" } },
      { id:"neutral", label:"neutral cartography", overrides:{ TWN:"Taiwan" } },
    ],
  },
  westernsahara: {
    id:"westernsahara", label:"western sahara", blurb:"the last unfinished decolonisation in africa.",
    center:[24.5, -13], zoom:5, parties:["MAR","ESH"],
    perspectives:[
      { id:"morocco", label:"morocco perspective", overrides:{ ESH:"Southern Provinces (Morocco)" } },
      { id:"polisario", label:"sahrawi (polisario) perspective", overrides:{ ESH:"Sahrawi Arab Democratic Republic" } },
      { id:"neutral", label:"un cartography", overrides:{ ESH:"Western Sahara (non-self-governing)" } },
    ],
  },
  crimea: {
    id:"crimea", label:"crimea & eastern ukraine", blurb:"annexed in one atlas, occupied in another.",
    center:[46.5, 35], zoom:5, parties:["UKR","RUS"], allies:["USA"],
    perspectives:[
      { id:"russia", label:"russia perspective", overrides:{ UKR:"Ukraine (excl. Crimea, Donbas)" } },
      { id:"ukraine", label:"ukraine perspective", overrides:{ UKR:"Ukraine (incl. Crimea & occupied oblasts)" } },
      { id:"neutral", label:"un cartography", overrides:{ UKR:"Ukraine" } },
    ],
  },
  cyprus: {
    id:"cyprus", label:"cyprus", blurb:"one island, one green line.",
    center:[35, 33], zoom:8, parties:["CYP","TUR"],
    perspectives:[
      { id:"roc", label:"republic of cyprus", overrides:{ CYP:"Republic of Cyprus (whole island)" } },
      { id:"trnc", label:"turkish perspective", overrides:{ CYP:"Cyprus · TRNC (north)" } },
    ],
  },
  hongkong: {
    id:"hongkong", label:"hong kong", blurb:"one country, two systems — until when?",
    center:[22.3, 114.1], zoom:9, parties:["CHN"],
    perspectives:[
      { id:"prc", label:"prc perspective", overrides:{} },
      { id:"prodem", label:"pro-democracy perspective", overrides:{} },
    ],
  },
  puertorico: {
    id:"puertorico", label:"puerto rico", blurb:"territory, state, or sovereign — three maps in waiting.",
    center:[18.2, -66.5], zoom:8, parties:["USA"],
    perspectives:[
      { id:"usa", label:"us territory", overrides:{} },
      { id:"statehood", label:"statehood advocates", overrides:{} },
      { id:"independence", label:"independence advocates", overrides:{} },
    ],
  },
  tibet: {
    id:"tibet", label:"tibet", blurb:"a plateau, a government-in-exile, a contested past.",
    center:[31.5, 88], zoom:5, parties:["CHN"],
    perspectives:[
      { id:"prc", label:"prc perspective", overrides:{} },
      { id:"exile", label:"tibetan gov-in-exile", overrides:{} },
    ],
  },
  chechnya: {
    id:"chechnya", label:"chechnya", blurb:"a federation subject, or a sovereign caucasus.",
    center:[43.4, 45.7], zoom:7, parties:["RUS"],
    perspectives:[
      { id:"russia", label:"russia perspective", overrides:{} },
      { id:"separatist", label:"chechen separatist", overrides:{} },
    ],
  },
  gibraltar: {
    id:"gibraltar", label:"gibraltar", blurb:"a rock with two flags pinned to it.",
    center:[36.14, -5.35], zoom:11, parties:["GBR","ESP"],
    perspectives:[
      { id:"uk", label:"uk perspective", overrides:{} },
      { id:"spain", label:"spain perspective", overrides:{} },
    ],
  },
  greenland: {
    id:"greenland", label:"greenland", blurb:"a kingdom holding an island that's almost a continent.",
    center:[72, -40], zoom:3, parties:["DNK","GRL"],
    perspectives:[
      { id:"denmark", label:"kingdom of denmark", overrides:{} },
      { id:"independence", label:"independence advocates", overrides:{} },
    ],
  },
  falklands: {
    id:"falklands", label:"falklands · malvinas", blurb:"two names, one wind-scraped archipelago.",
    center:[-51.7, -59], zoom:7, parties:["GBR","ARG"],
    perspectives:[
      { id:"uk", label:"uk perspective", overrides:{} },
      { id:"argentina", label:"argentina perspective", overrides:{} },
    ],
  },
  guantanamo: {
    id:"guantanamo", label:"guantánamo bay", blurb:"a lease that one side stopped cashing.",
    center:[19.9, -75.15], zoom:10, parties:["USA","CUB"],
    perspectives:[
      { id:"usa", label:"us perspective", overrides:{} },
      { id:"cuba", label:"cuba perspective", overrides:{} },
    ],
  },
  catalonia: {
    id:"catalonia", label:"catalonia", blurb:"a parliament, a referendum, a republic still pending.",
    center:[41.8, 1.7], zoom:7, parties:["ESP"],
    perspectives:[
      { id:"spain", label:"spain perspective", overrides:{} },
      { id:"indep", label:"catalan independence", overrides:{} },
    ],
  },
  basque: {
    id:"basque", label:"basque country", blurb:"a language older than the borders that cross it.",
    center:[43, -2], zoom:7, parties:["ESP","FRA"],
    perspectives:[
      { id:"spain", label:"spain perspective", overrides:{} },
      { id:"basque", label:"basque nationalist", overrides:{} },
    ],
  },
  golan: {
    id:"golan", label:"golan heights", blurb:"a plateau annexed on one map, occupied on another.",
    center:[33, 35.8], zoom:9, parties:["ISR","SYR"], allies:["USA"],
    perspectives:[
      { id:"israel", label:"israel perspective", overrides:{} },
      { id:"syria", label:"syria perspective", overrides:{} },
    ],
  },
};

interface Props { id: string }

export default function Conflict({ id }: Props) {
  const def = CONFLICTS[id] ?? CONFLICTS.kashmir;
  const [pIdx, setPIdx] = useState(0);
  const overrides = def.perspectives[pIdx]?.overrides ?? {};

  // inject a temporary region into REGIONS so Atlas reads the right center/zoom + label
  const key = `conflict:${def.id}`;
  useMemo(() => {
    REGIONS[key] = {
      key, label: `conflict · ${def.label}`,
      center: def.center, zoom: def.zoom,
      blurb: def.blurb,
      labelMode: "countries",
    };
  }, [key, def]);

  return (
    <>
      <Atlas region={key} labelOverrides={overrides} />
      {/* perspective toggle — floats above the atlas chrome */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[50] pointer-events-auto">
        <div className="inline-flex items-center gap-1 bg-card/90 backdrop-blur-2xl border border-border/70 rounded-full p-1 shadow-sm">
          {def.perspectives.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPIdx(i)}
              className={[
                "px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                i === pIdx ? "bg-foreground/90 text-background" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}