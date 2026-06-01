export interface RegionConfig {
  key: string;
  label: string;
  center: [number, number];
  zoom: number;
  blurb: string;
  /** when present, AtlasMap renders this geojson as the borders/labels layer */
  subdivisionsUrl?: string;
  /** "continents" = giant continent labels; default = country labels from world.geo.json */
  labelMode?: "continents" | "countries" | "subdivisions";
}

export const REGIONS: Record<string, RegionConfig> = {
  world:   { key:"world",   label:"world",   center:[22, 6],     zoom: 2, blurb: "the whole atlas, drawn quietly", labelMode: "continents" },
  europe:  { key:"europe",  label:"europe",  center:[52, 14],    zoom: 4, blurb: "a peninsula folded into many republics" },
  america:      { key:"america",      label:"americas",       center:[8, -72],    zoom: 3, blurb: "two continents read as one long shoreline" },
  northamerica: { key:"northamerica", label:"north america",  center:[45, -100],  zoom: 3, blurb: "boreal forests, plains, and three federations" },
  southamerica: { key:"southamerica", label:"south america",  center:[-15, -60],  zoom: 3, blurb: "andes spine, amazon basin, southern cone" },
  mena:         { key:"mena",         label:"middle east (mena)", center:[29, 32], zoom: 5, blurb: "the middle east threaded through north africa" },
  asia:    { key:"asia",    label:"asia",    center:[34, 95],    zoom: 3, blurb: "the largest landmass and its many interiors" },
  africa:  { key:"africa",  label:"africa",  center:[2, 20],     zoom: 3, blurb: "fifty-four sovereignties along old caravan lines" },
  oceania: { key:"oceania", label:"oceania", center:[-22, 145],  zoom: 3, blurb: "an archipelago the size of an ocean" },

  // country-level subdivisions ("other")
  canada: {
    key: "canada", label: "canada (provinces)", center: [60, -100], zoom: 3,
    blurb: "ten provinces, three territories",
    labelMode: "subdivisions",
    subdivisionsUrl: "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson",
  },
  unitedstates: {
    key: "unitedstates", label: "united states (states)", center: [42, -112], zoom: 3,
    blurb: "fifty states held in a federal weave",
    labelMode: "subdivisions",
    subdivisionsUrl: "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json",
  },
  unitedkingdom: {
    key: "unitedkingdom", label: "united kingdom (nations)", center: [54.5, -3], zoom: 5,
    blurb: "four nations under one crown",
    labelMode: "subdivisions",
    subdivisionsUrl: "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/united-kingdom.geojson",
  },
  australia: {
    key: "australia", label: "australia (states)", center: [-26, 134], zoom: 4,
    blurb: "six states and two territories across the continent",
    labelMode: "subdivisions",
    subdivisionsUrl: "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/australia.geojson",
  },
  newzealand: {
    key: "newzealand", label: "new zealand (regions)", center: [-41, 173], zoom: 5,
    blurb: "sixteen regions across two long islands",
    labelMode: "subdivisions",
    subdivisionsUrl: "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/new-zealand.geojson",
  },
};

export const REGION_ORDER = ["world","europe","northamerica","southamerica","asia","africa","mena","oceania"];
export const OTHER_ORDER = ["canada","unitedstates","unitedkingdom","australia","newzealand"];