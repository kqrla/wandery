// Filter sets and watercolor overlay colors used by the atlas chrome.
// Country membership is keyed by ISO_A3 codes (matches johan/world.geo.json `id`).

export type FilterId = string;

export interface FilterDef {
  id: FilterId;
  label: string;        // displayed as "#eu", "#nato" …
  color: string;        // rgb without alpha — used as watercolor tint
  countries: Set<string>;
  note?: string;
}

const s = (arr: string[]) => new Set(arr);

// Membership sets — intentionally concise but credible.
const EU = s(["AUT","BEL","BGR","HRV","CYP","CZE","DNK","EST","FIN","FRA","DEU","GRC","HUN","IRL","ITA","LVA","LTU","LUX","MLT","NLD","POL","PRT","ROU","SVK","SVN","ESP","SWE"]);
const EEA = s([...Array.from(EU), "ISL","LIE","NOR"]);
const SCHENGEN = s(["AUT","BEL","BGR","HRV","CZE","DNK","EST","FIN","FRA","DEU","GRC","HUN","ISL","ITA","LVA","LIE","LTU","LUX","MLT","NLD","NOR","POL","PRT","ROU","SVK","SVN","ESP","SWE","CHE"]);
const NATO = s(["ALB","BEL","BGR","CAN","HRV","CZE","DNK","EST","FIN","FRA","DEU","GRC","HUN","ISL","ITA","LVA","LTU","LUX","MNE","NLD","MKD","NOR","POL","PRT","ROU","SVK","SVN","ESP","SWE","TUR","GBR","USA"]);
const ANGLOSPHERE = s(["USA","GBR","CAN","AUS","NZL","IRL"]);
const COMMONWEALTH = s(["GBR","CAN","AUS","NZL","IND","ZAF","NGA","KEN","JAM","SGP","MYS","PAK","BGD","LKA","GHA","UGA","TZA","ZMB","ZWE","MOZ","CYP","MLT","PNG","FJI"]);
const G20 = s(["ARG","AUS","BRA","CAN","CHN","FRA","DEU","IND","IDN","ITA","JPN","MEX","RUS","SAU","ZAF","KOR","TUR","GBR","USA"]);
const BRICS = s(["BRA","RUS","IND","CHN","ZAF","IRN","EGY","ETH","ARE"]);
const ISLANDS = s(["ISL","IRL","GBR","JPN","PHL","IDN","NZL","CUB","JAM","HTI","DOM","MDG","LKA","TWN","CYP","MLT","FJI","PNG","SLB","VUT","WSM","TON","KIR","MHL","FSM","PLW","NRU","TUV","COM","MUS","SYC","CPV","STP","BHS","BRB","TTO","GRD","LCA","VCT","ATG","DMA","KNA"]);
const LANDLOCKED = s(["AFG","AND","ARM","AUT","AZE","BLR","BTN","BOL","BWA","BFA","BDI","CAF","TCD","CZE","SWZ","ETH","HUN","KAZ","KGZ","LAO","LSO","LIE","LUX","MKD","MWI","MLI","MDA","MNG","NPL","NER","PRY","RWA","SMR","SRB","SVK","SSS","SSD","CHE","TJK","UGA","UZB","VAT","ZMB","ZWE"]);
const ARAB = s(["DZA","BHR","COM","DJI","EGY","IRQ","JOR","KWT","LBN","LBY","MRT","MAR","OMN","PSE","QAT","SAU","SOM","SDN","SYR","TUN","ARE","YEM"]);
const FRANCOPHONE = s(["FRA","BEL","CHE","LUX","MCO","CAN","HTI","SEN","CIV","BFA","MLI","NER","TCD","CAF","COG","COD","GAB","GIN","BEN","TGO","CMR","MDG","DJI","COM","RWA","BDI","MRT","DZA","MAR","TUN","VUT"]);
const POST_SOVIET = s(["RUS","UKR","BLR","MDA","EST","LVA","LTU","ARM","AZE","GEO","KAZ","KGZ","TJK","TKM","UZB"]);
const NORDIC = s(["DNK","FIN","ISL","NOR","SWE"]);
const SCANDINAVIA = s(["DNK","NOR","SWE"]);
const BALTICS = s(["EST","LVA","LTU"]);
const BENELUX = s(["BEL","NLD","LUX"]);
const CAUCASUS = s(["ARM","AZE","GEO"]);
const BALKANS = s(["ALB","BIH","BGR","HRV","GRC","XKX","MNE","MKD","ROU","SRB","SVN"]);
const YUGOSLAVIA = s(["BIH","HRV","XKX","MNE","MKD","SRB","SVN"]);
const SLAVIC = s(["BLR","BGR","HRV","CZE","MKD","POL","RUS","SRB","SVK","SVN","UKR","BIH","MNE"]);
const MEDITERRANEAN = s(["ESP","FRA","MCO","ITA","MLT","SVN","HRV","BIH","MNE","ALB","GRC","TUR","CYP","SYR","LBN","ISR","PSE","EGY","LBY","TUN","DZA","MAR"]);
const GLOBAL_SOUTH = s(["BRA","ARG","CHL","PER","BOL","COL","ECU","VEN","MEX","ZAF","NGA","KEN","ETH","GHA","TZA","UGA","SEN","CIV","IND","IDN","PHL","VNM","BGD","PAK","LKA","NPL","MMR","KHM","LAO","THA","EGY","MAR","DZA"]);
const DEMOCRACIES = s(["USA","CAN","GBR","FRA","DEU","ITA","ESP","PRT","NLD","BEL","LUX","IRL","AUT","DNK","SWE","NOR","FIN","ISL","CHE","CZE","POL","HUN","SVK","SVN","HRV","EST","LVA","LTU","GRC","CYP","MLT","ROU","BGR","JPN","KOR","TWN","AUS","NZL","IND","ISR","CHL","URY","CRI","BRA","ARG","MEX","ZAF","GHA"]);

export const FILTERS: Record<FilterId, FilterDef> = {
  eu:            { id:"eu",            label:"#eu",            color:"99 130 178", countries: EU },
  eea:           { id:"eea",           label:"#eea",           color:"118 148 188", countries: EEA },
  schengen:      { id:"schengen",      label:"#schengen",      color:"140 165 192", countries: SCHENGEN },
  nato:          { id:"nato",          label:"#nato",          color:"196 132 142", countries: NATO },
  anglosphere:   { id:"anglosphere",   label:"#anglosphere",   color:"158 178 142", countries: ANGLOSPHERE },
  commonwealth:  { id:"commonwealth",  label:"#commonwealth",  color:"176 152 130", countries: COMMONWEALTH },
  democracies:   { id:"democracies",   label:"#democracies",   color:"170 180 196", countries: DEMOCRACIES },
  g20:           { id:"g20",           label:"#g20",           color:"178 160 134", countries: G20 },
  brics:         { id:"brics",         label:"#brics",         color:"188 138 122", countries: BRICS },
  islandnations: { id:"islandnations", label:"#islandnations", color:"148 184 188", countries: ISLANDS },
  landlocked:    { id:"landlocked",    label:"#landlocked",    color:"184 168 140", countries: LANDLOCKED },
  arabworld:     { id:"arabworld",     label:"#arabworld",     color:"190 162 118", countries: ARAB },
  francophone:   { id:"francophone",   label:"#francophone",   color:"148 142 184", countries: FRANCOPHONE },
  postsoviet:    { id:"postsoviet",    label:"#postsoviet",    color:"172 152 184", countries: POST_SOVIET },
  globalsouth:   { id:"globalsouth",   label:"#globalsouth",   color:"190 150 130", countries: GLOBAL_SOUTH },

  // europe-specific
  balkans:       { id:"balkans",       label:"#balkans",       color:"198 138 118", countries: BALKANS },
  scandinavia:   { id:"scandinavia",   label:"#scandinavia",   color:"160 188 196", countries: SCANDINAVIA },
  nordic:        { id:"nordic",        label:"#nordic",        color:"150 184 198", countries: NORDIC },
  slavic:        { id:"slavic",        label:"#slavic",        color:"168 148 188", countries: SLAVIC },
  baltics:       { id:"baltics",       label:"#baltics",       color:"152 174 188", countries: BALTICS },
  benelux:       { id:"benelux",       label:"#benelux",       color:"180 168 132", countries: BENELUX },
  caucasus:      { id:"caucasus",      label:"#caucasus",      color:"186 152 142", countries: CAUCASUS },
  formeryugoslavia:{ id:"formeryugoslavia", label:"#formeryugoslavia", color:"196 140 124", countries: YUGOSLAVIA },
  mediterranean: { id:"mediterranean", label:"#mediterranean", color:"176 164 122", countries: MEDITERRANEAN },
};

export const WORLD_FILTERS: FilterId[] = [
  "eu","eea","schengen","nato","anglosphere","democracies","g20","brics",
  "islandnations","landlocked","commonwealth","arabworld","francophone","postsoviet","globalsouth",
];

export const EUROPE_FILTERS: FilterId[] = [
  "eu","eea","schengen","balkans","scandinavia","nordic","slavic","baltics",
  "benelux","caucasus","formeryugoslavia","postsoviet","mediterranean",
];

export function filtersFor(region: string): FilterId[] {
  if (region === "europe") return EUROPE_FILTERS;
  if (region === "africa") return ["arabworld","francophone","commonwealth","mediterranean","globalsouth","islandnations","landlocked"];
  if (region === "asia") return ["postsoviet","arabworld","brics","g20","islandnations","commonwealth","landlocked"];
  if (region === "america") return ["nato","anglosphere","democracies","g20","brics","globalsouth","islandnations","commonwealth"];
  if (region === "northamerica") return ["nato","anglosphere","democracies","g20","commonwealth","francophone"];
  if (region === "southamerica") return ["g20","brics","globalsouth","democracies","mediterranean"];
  if (region === "mena") return ["arabworld","mediterranean","francophone","g20","globalsouth"];
  if (region === "oceania") return ["anglosphere","commonwealth","democracies","islandnations","francophone"];
  if (region === "canada" || region === "unitedstates") return [];
  return WORLD_FILTERS;
}

export function affiliationsForCountry(iso: string): FilterDef[] {
  return Object.values(FILTERS).filter(f => f.countries.has(iso));
}