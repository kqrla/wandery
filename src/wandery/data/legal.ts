// Legal system families per ISO_A3. A country may appear in multiple
// families — the atlas blends colors for hybrid jurisdictions.

export type LegalSystem = "common" | "civil" | "religious" | "customary";

export interface LegalSystemDef {
  id: LegalSystem;
  label: string;
  /** rgb triplet (no parens), used to mix tints */
  rgb: [number, number, number];
  countries: Set<string>;
  /** nested sub-traditions; activating any narrows the parent set */
  subs?: Array<{ id: string; label: string; countries: Set<string> }>;
}

const COMMON = new Set([
  "USA","GBR","CAN","AUS","NZL","IRL","IND","PAK","BGD","LKA","MYS","SGP",
  "NGA","KEN","GHA","ZAF","JAM","TTO","BHS","BRB","BLZ","FJI","UGA","TZA",
  "ZMB","ZWE","MWI","CYP","MLT","HKG","ISR",
]);
const CIVIL = new Set([
  "FRA","DEU","ITA","ESP","PRT","NLD","BEL","LUX","CHE","AUT","CZE","SVK",
  "POL","HUN","SVN","HRV","ROU","BGR","GRC","DNK","SWE","NOR","FIN","ISL",
  "RUS","UKR","BLR","KAZ","UZB","TKM","KGZ","TJK","MDA","ARM","AZE","GEO",
  "TUR","BRA","ARG","CHL","MEX","COL","PER","VEN","ECU","BOL","PRY","URY",
  "DOM","CUB","PAN","GTM","CRI","HND","NIC","SLV","HTI",
  "JPN","KOR","CHN","VNM","TWN","IDN","THA","KHM","LAO","MNG",
  "EGY","TUN","DZA","MAR","LBN","SYR","JOR","IRQ","SEN","CIV","CMR","COD",
  "ANG","MOZ","ETH","MDG","GAB","COG","BFA","MLI","NER","BEN","TGO","GIN","GNB",
  "EST","LVA","LTU","SRB","BIH","MNE","MKD","ALB","XKX",
]);
const RELIGIOUS = new Set([
  "SAU","IRN","AFG","YEM","MRT","SDN","PAK","ARE","QAT","KWT","BHR","OMN",
  "LBY","BRN","MDV",
]);
const CUSTOMARY = new Set([
  "BTN","NPL","PNG","SLB","VUT","TLS","MMR","ETH","ERI","MDG","WSM","TON",
]);

export const LEGAL_SYSTEMS: Record<LegalSystem, LegalSystemDef> = {
  common:    { id:"common", label:"common law", rgb:[120, 158, 196], countries: COMMON, subs: [
    { id:"english", label:"english common", countries: new Set(["GBR","IRL","CYP","MLT","HKG","SGP","MYS","IND","PAK","BGD","LKA","NGA","KEN","GHA","ZAF","UGA","TZA","ZMB","ZWE","MWI","AUS","NZL","CAN","JAM","TTO","BHS","BRB","BLZ","FJI"]) },
    { id:"american", label:"american common", countries: new Set(["USA"]) },
  ]},
  civil:     { id:"civil", label:"civil law", rgb:[198, 132, 142], countries: CIVIL, subs: [
    { id:"napoleonic", label:"french / napoleonic", countries: new Set(["FRA","BEL","LUX","NLD","ITA","ESP","PRT","ROU","HTI","DOM","SEN","CIV","CMR","COD","ANG","MOZ","GAB","COG","BFA","MLI","NER","BEN","TGO","GIN","GNB","MDG","CRI","PAN","HND","NIC","SLV","GTM","MEX","BRA","ARG","CHL","COL","PER","VEN","BOL","ECU","PRY","URY","CUB","LBN","SYR","JOR","EGY","TUN","DZA","MAR","IRQ"]) },
    { id:"germanic", label:"germanic", countries: new Set(["DEU","AUT","CHE","CZE","SVK","POL","HUN","SVN","HRV","EST","LVA","LTU","GRC","JPN","KOR","TWN","THA","TUR"]) },
    { id:"sovietpost", label:"post-soviet", countries: new Set(["RUS","UKR","BLR","KAZ","UZB","TKM","KGZ","TJK","MDA","ARM","AZE","GEO"]) },
    { id:"nordic", label:"nordic", countries: new Set(["DNK","SWE","NOR","FIN","ISL"]) },
    { id:"sinic", label:"sinic socialist", countries: new Set(["CHN","VNM","LAO","KHM","MNG","PRK"]) },
  ]},
  religious: { id:"religious", label:"religious law", rgb:[176, 152, 92], countries: RELIGIOUS, subs: [
    { id:"sharia", label:"sharia", countries: new Set(["SAU","IRN","AFG","YEM","MRT","SDN","PAK","ARE","QAT","KWT","BHR","OMN","LBY","BRN","MDV"]) },
    { id:"halakha", label:"halakhic (personal status)", countries: new Set(["ISR"]) },
    { id:"canon", label:"canon-derived", countries: new Set(["VAT"]) },
  ]},
  customary: { id:"customary", label:"customary law", rgb:[122, 162, 132], countries: CUSTOMARY, subs: [
    { id:"indigenous", label:"indigenous / tribal", countries: new Set(["PNG","SLB","VUT","TLS","WSM","TON","BTN","NPL","MMR"]) },
    { id:"horn", label:"horn of africa", countries: new Set(["ETH","ERI","MDG"]) },
  ]},
};

export const LEGAL_ORDER: LegalSystem[] = ["common","civil","religious","customary"];

/** Blend the rgb triplets of every active system the country belongs to.
 *  When subActive contains sub-tradition ids for an active parent, the country
 *  must also live in at least one of those sub sets for that parent. */
export function legalBlend(iso: string, active: LegalSystem[], subActive: string[] = []): [number, number, number] | null {
  const hits = active.filter(k => {
    const def = LEGAL_SYSTEMS[k];
    if (!def.countries.has(iso)) return false;
    const activeSubs = (def.subs ?? []).filter(s => subActive.includes(`${k}:${s.id}`));
    if (!activeSubs.length) return true; // parent only — no narrowing
    return activeSubs.some(s => s.countries.has(iso));
  });
  if (!hits.length) return null;
  let r = 0, g = 0, b = 0;
  hits.forEach(k => {
    const [rr, gg, bb] = LEGAL_SYSTEMS[k].rgb;
    r += rr; g += gg; b += bb;
  });
  return [Math.round(r / hits.length), Math.round(g / hits.length), Math.round(b / hits.length)];
}