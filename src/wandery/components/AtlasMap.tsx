import { useEffect, useRef, useState } from "react";
import { ensureLeaflet, loadCountries } from "@/wandery/lib/leaflet";
import { FILTERS, type FilterId } from "@/wandery/data/filters";
import { polititiesAt, suppressedIsos, countryExists, COUNTRY_BIRTH } from "@/wandery/data/history";
import { countriesForTag, colorForTag, type TagKind } from "@/wandery/data/identity";
import { legalBlend, type LegalSystem } from "@/wandery/data/legal";

const TILE_BASE = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";

const REFERENCE_MAP_COLORS = {
  ocean: [190, 218, 199],
  land: [248, 231, 236],
  road: [242, 174, 203],
  park: [239, 206, 174],
} as const;

const REFERENCE_LAND_FILL = "#f8e7ec";

function blendChannel(source: number, target: number, strength: number) {
  return Math.round(source * (1 - strength) + target * strength);
}

function recolorPixel(red: number, green: number, blue: number): readonly [number, number, number] {
  const lightness = (Math.max(red, green, blue) + Math.min(red, green, blue)) / 2;
  const blueLead = blue - Math.max(red, green);
  const greenLead = green - Math.max(red, blue);
  const redLead = red - Math.max(green, blue);
  const isOcean = blueLead > 4 || (greenLead > 8 && blue > red + 2);
  const isRoad = redLead > 7 && green < 215;
  const isParkOrTerrain = greenLead > 4 || (red > green + 8 && green > blue + 8 && lightness < 230);
  const target = isOcean
    ? REFERENCE_MAP_COLORS.ocean
    : isRoad
      ? REFERENCE_MAP_COLORS.road
      : isParkOrTerrain
        ? REFERENCE_MAP_COLORS.park
        : REFERENCE_MAP_COLORS.land;
  const strength = isOcean ? 0.9 : isRoad ? 0.72 : isParkOrTerrain ? 0.5 : 0.64;

  return [
    blendChannel(red, target[0], strength),
    blendChannel(green, target[1], strength),
    blendChannel(blue, target[2], strength),
  ];
}

function createReferenceThemeTileLayer(L: any) {
  return L.TileLayer.extend({
    createTile(coords: any, done: (error?: Error | null, tile?: HTMLCanvasElement) => void) {
      const tile = document.createElement("canvas");
      const tileSize = this.getTileSize();
      tile.width = tileSize.x;
      tile.height = tileSize.y;

      const sourceImage = new Image();
      sourceImage.crossOrigin = "anonymous";
      sourceImage.onload = () => {
        const context = tile.getContext("2d", { willReadFrequently: true });
        if (!context) {
          done(null, tile);
          return;
        }

        context.drawImage(sourceImage, 0, 0, tile.width, tile.height);
        const tilePixels = context.getImageData(0, 0, tile.width, tile.height);
        const pixels = tilePixels.data;

        for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex += 4) {
          const [red, green, blue] = recolorPixel(pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]);
          pixels[pixelIndex] = red;
          pixels[pixelIndex + 1] = green;
          pixels[pixelIndex + 2] = blue;
        }

        context.putImageData(tilePixels, 0, 0);
        done(null, tile);
      };
      sourceImage.onerror = () => done(new Error("map tile failed to load"), tile);
      sourceImage.src = this.getTileUrl(coords);
      return tile;
    },
  });
}

/**
 * Approximate India-claimed boundary of Jammu & Kashmir (including Gilgit-
 * Baltistan and Aksai Chin). The base world.geo.json renders the de-facto
 * LoC/LAC; we overlay this polygon so the atlas reads India's claimed outline.
 * Coordinates: [lng, lat]. Hand-traced approximation.
 */
const INDIA_CLAIM_KASHMIR: any = {
  type: "Feature",
  id: "IND-CLAIM-KASHMIR",
  properties: { name: "Kashmir (India claim)", parent: "IND" },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [74.00, 32.50], [73.90, 33.20], [73.80, 34.00], [73.70, 34.70],
      [74.10, 35.40], [74.40, 36.20], [74.70, 36.80], [75.40, 37.05],
      [76.30, 37.00], [77.40, 36.60], [78.40, 35.90], [79.50, 35.50],
      [80.30, 35.30], [80.40, 34.50], [79.60, 33.80], [78.80, 33.30],
      [78.50, 32.80], [78.10, 32.55], [77.30, 32.60], [76.50, 32.40],
      [75.40, 32.30], [74.50, 32.40], [74.00, 32.50],
    ]],
  },
};

// hardcoded continent label anchors for the /world view
const CONTINENTS: { name: string; pos: [number, number] }[] = [
  { name: "NORTH AMERICA", pos: [46, -100] },
  { name: "SOUTH AMERICA", pos: [-15, -60] },
  { name: "EUROPE",        pos: [54, 18] },
  { name: "AFRICA",         pos: [3, 22] },
  { name: "ASIA",           pos: [46, 95] },
  { name: "OCEANIA",        pos: [-25, 140] },
  { name: "ANTARCTICA",     pos: [-78, 0] },
];

// rough centroid from a GeoJSON feature (avg of outer-ring coords)
function featureCentroid(feat: any): [number, number] | null {
  const g = feat?.geometry; if (!g) return null;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : null;
  if (!polys) return null;
  let best: any[] = []; let bestLen = 0;
  polys.forEach((p: any) => { const ring = p[0] || []; if (ring.length > bestLen) { bestLen = ring.length; best = ring; } });
  if (!best.length) return null;
  let x = 0, y = 0;
  best.forEach(([lng, lat]: number[]) => { x += lng; y += lat; });
  return [y / best.length, x / best.length];
}

export interface ToggleState {
  labels: boolean;
  borders: boolean;
  terrain: boolean;
  pins: boolean;
}

interface Props {
  center: [number, number];
  zoom: number;
  activeFilters: FilterId[];
  toggles: ToggleState;
  year: number;
  labelMode?: "continents" | "countries" | "subdivisions";
  subdivisionsUrl?: string;
  highlightTag?: { kind: TagKind; tag: string } | null;
  legalActive?: LegalSystem[];
  legalSubActive?: string[];
  labelOverrides?: Record<string, string>;
  onCountry: (iso: string, name: string) => void;
  onCountryContext?: (iso: string, name: string, x: number, y: number) => void;
}

export default function AtlasMap({ center, zoom, activeFilters, toggles, year, labelMode = "countries", subdivisionsUrl, highlightTag, legalActive, legalSubActive, labelOverrides, onCountry, onCountryContext }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const labelsLayer = useRef<any>(null);
  const bordersLayer = useRef<any>(null);
  const overlayLayers = useRef<any[]>([]);
  const historyLayers = useRef<any[]>([]);
  const countriesRef = useRef<any>(null);
  const subdivisionsRef = useRef<any>(null);
  const subdivisionsLayer = useRef<any>(null);
  const claimLayer = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [subKey, setSubKey] = useState(0);
  const handlersRef = useRef({ onCountry, onCountryContext });
  useEffect(() => { handlersRef.current = { onCountry, onCountryContext }; });

  useEffect(() => {
    ensureLeaflet(async () => {
      if (mapRef.current || !ref.current) return;
      const L = (window as any).L;
      const map = L.map(ref.current, {
        center, zoom, zoomControl: false,
        worldCopyJump: true, zoomSnap: 0.25,
        wheelPxPerZoomLevel: 140, inertia: true,
      });
      const ReferenceThemeTileLayer = createReferenceThemeTileLayer(L);
      new ReferenceThemeTileLayer(TILE_BASE, {
        maxZoom: 10,
        attribution: "© OpenStreetMap © CARTO",
      }).addTo(map);
      mapRef.current = map;
      const data = await loadCountries();
      countriesRef.current = data;
      setReady(true);
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) mapRef.current.flyTo(center, zoom, { duration: 1.6, easeLinearity: 0.25 });
  }, [center[0], center[1], zoom]);

  // fetch subdivisions when url changes
  useEffect(() => {
    subdivisionsRef.current = null;
    setSubKey(k => k + 1);
    if (!subdivisionsUrl) return;
    let cancel = false;
    fetch(subdivisionsUrl).then(r => r.json()).then(j => {
      if (cancel) return;
      subdivisionsRef.current = j;
      setSubKey(k => k + 1);
    }).catch(() => {});
    return () => { cancel = true; };
  }, [subdivisionsUrl]);

  useEffect(() => {
    if (!ready || !mapRef.current || !countriesRef.current) return;
    const L = (window as any).L;
    // tear down previous label layer; rebuild from scratch each time the mode changes
    if (labelsLayer.current) { labelsLayer.current.remove(); labelsLayer.current = null; }
    if (!toggles.labels) return;

    const group = L.layerGroup();

    if (labelMode === "continents") {
      CONTINENTS.forEach(({ name, pos }) => {
        L.marker(pos, {
          interactive: false,
          icon: L.divIcon({
            className: "wd-continent-label",
            html: `<span>${name}</span>`,
            iconSize: [0, 0],
          }),
        }).addTo(group);
      });
    } else if (labelMode === "subdivisions" && subdivisionsRef.current) {
      subdivisionsRef.current.features.forEach((feat: any) => {
        const c = featureCentroid(feat);
        const name = feat.properties?.name || feat.properties?.NAME;
        if (!c || !name) return;
        L.marker(c, {
          interactive: false,
          icon: L.divIcon({ className: "wd-country-label", html: `<span>${name}</span>`, iconSize: [0, 0] }),
        }).addTo(group);
      });
    } else {
      const suppressed = suppressedIsos(year);
      countriesRef.current.features.forEach((feat: any) => {
        const iso = feat.id;
        if (iso === "PSE") return; // merged into Israel visually
        if (suppressed.has(iso) || !countryExists(iso, year)) return; // hidden in this era
        const c = featureCentroid(feat);
        const name = labelOverrides?.[iso] ?? feat.properties?.name;
        if (!c || !name) return;
        L.marker(c, {
          interactive: false,
          icon: L.divIcon({ className: "wd-country-label", html: `<span>${name}</span>`, iconSize: [0, 0] }),
        }).addTo(group);
      });
    }

    group.addTo(mapRef.current);
    labelsLayer.current = group;
  }, [toggles.labels, ready, labelMode, subKey, year, labelOverrides]);

  useEffect(() => {
    if (!ready || !mapRef.current || !countriesRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;

    overlayLayers.current.forEach(l => l.remove());
    overlayLayers.current = [];
    historyLayers.current.forEach(l => l.remove());
    historyLayers.current = [];
    bordersLayer.current?.remove();
    bordersLayer.current = null;
    subdivisionsLayer.current?.remove();
    subdivisionsLayer.current = null;
    claimLayer.current?.remove();
    claimLayer.current = null;

    const ageFade = Math.max(0, Math.min(1, (year - 1800) / (2025 - 1800)));
    const borderOpacity = toggles.borders ? 0.18 + 0.08 * ageFade : 0.04;
    const suppressed = suppressedIsos(year);

    const base = L.geoJSON(countriesRef.current, {
      filter: (f: any) => f.id !== "PSE" && !suppressed.has(f.id) && countryExists(f.id, year),
      style: (f: any) => {
        return {
          color: "rgba(80,60,70,1)",
          weight: 0.6,
          opacity: borderOpacity,
          fillColor: REFERENCE_LAND_FILL,
          fillOpacity: 0.72,
        };
      },
      onEachFeature: (feat: any, layer: any) => {
        const iso = feat.id || feat.properties?.iso_a3 || "";
        const name = labelOverrides?.[iso] ?? feat.properties?.name ?? "";
        layer.on({
          mouseover: () => layer.setStyle({ weight: 1.2, opacity: 0.55, fillColor: "#f2aecb", fillOpacity: 0.36 }),
          mouseout: () => layer.setStyle({
            weight: 0.6, opacity: borderOpacity,
            fillColor: REFERENCE_LAND_FILL, fillOpacity: 0.72,
          }),
          click: () => handlersRef.current.onCountry(iso, name),
          contextmenu: (e: any) => {
            e.originalEvent?.preventDefault?.();
            const p = e.originalEvent;
            handlersRef.current.onCountryContext?.(iso, name, p?.clientX ?? 0, p?.clientY ?? 0);
          },
        });
        layer.bindTooltip(`<span class="wd-tt-name">${name}</span>`, {
          direction: "top", sticky: true, className: "wd-hover-tooltip", opacity: 1,
        });
      },
    }).addTo(map);
    bordersLayer.current = base;
    overlayLayers.current.push(base);

    // historical polities — paint members of any active polity as one block
    polititiesAt(year).forEach(p => {
      const members = new Set(p.members);
      const layer = L.geoJSON(countriesRef.current, {
        filter: (f: any) => members.has(f.id),
        interactive: false,
        style: () => ({
          color: `rgb(${p.color})`, weight: 1.1, opacity: 0.7,
          fillColor: `rgb(${p.color})`, fillOpacity: 0.22,
        }),
      }).addTo(map);
      historyLayers.current.push(layer);
      const label = L.marker(p.labelAt, {
        interactive: false,
        icon: L.divIcon({
          className: "wd-polity-label",
          html: `<span>${p.name}</span>`,
          iconSize: [0, 0],
        }),
      }).addTo(map);
      historyLayers.current.push(label);
    });

    // India's claimed Kashmir — painted as part of India, dashed border = claim
    const claim = L.geoJSON(INDIA_CLAIM_KASHMIR, {
      style: () => ({
        color: "rgba(80,60,70,0.85)",
        weight: 1.1,
        opacity: 0.65,
        dashArray: "4 4",
        fillColor: "#f4ead8",
        fillOpacity: 0.32,
      }),
      onEachFeature: (_f: any, layer: any) => {
        layer.on({
          mouseover: () => layer.setStyle({ fillOpacity: 0.45, weight: 1.4 }),
          mouseout: () => layer.setStyle({ fillOpacity: 0.32, weight: 1.1 }),
          click: () => handlersRef.current.onCountry("IND", "India"),
        });
        layer.bindTooltip(`<span class="wd-tt-name">Kashmir · India claim</span>`, {
          direction: "top", sticky: true, className: "wd-hover-tooltip", opacity: 1,
        });
      },
    }).addTo(map);
    claimLayer.current = claim;
    overlayLayers.current.push(claim);

    if (subdivisionsRef.current) {
      const sub = L.geoJSON(subdivisionsRef.current, {
        style: () => ({
          color: "rgba(80,60,70,1)", weight: 0.8, opacity: 0.45,
          fillColor: "#ffffff", fillOpacity: 0,
        }),
        onEachFeature: (feat: any, layer: any) => {
          const name = feat.properties?.name || feat.properties?.NAME || "";
          layer.on({
            mouseover: () => layer.setStyle({ weight: 1.4, opacity: 0.75, fillColor: "#f4ead8", fillOpacity: 0.22 }),
            mouseout: () => layer.setStyle({ weight: 0.8, opacity: 0.45, fillColor: "#ffffff", fillOpacity: 0 }),
          });
          if (name) layer.bindTooltip(`<span class="wd-tt-name">${name}</span>`, {
            direction: "top", sticky: true, className: "wd-hover-tooltip", opacity: 1,
          });
        },
      }).addTo(map);
      subdivisionsLayer.current = sub;
      overlayLayers.current.push(sub);
    }

    activeFilters.forEach((fid, idx) => {
      const def = FILTERS[fid];
      if (!def) return;
      const alpha = 0.18;
      const layer = L.geoJSON(countriesRef.current, {
        filter: (f: any) => def.countries.has(f.id),
        interactive: false,
        style: () => ({
          color: `rgb(${def.color})`, weight: 0.5, opacity: 0.35,
          fillColor: `rgb(${def.color})`, fillOpacity: alpha,
        }),
      }).addTo(map);
      overlayLayers.current.push(layer);

      const halo = L.geoJSON(countriesRef.current, {
        filter: (f: any) => def.countries.has(f.id),
        interactive: false,
        style: () => ({
          color: `rgb(${def.color})`, weight: 4 + idx * 0.5,
          opacity: 0.08, fill: false,
        }),
      }).addTo(map);
      overlayLayers.current.push(halo);
    });

    // ── tag highlight overlay (from country preview chip click) ──
    if (highlightTag) {
      const isos = new Set(countriesForTag(highlightTag.kind, highlightTag.tag));
      const tagColor = colorForTag(highlightTag.kind, highlightTag.tag); // hsl(...)
      const fill = L.geoJSON(countriesRef.current, {
        filter: (f: any) => isos.has(f.id),
        interactive: false,
        style: () => ({
          color: tagColor, weight: 1.0, opacity: 0.7,
          fillColor: tagColor, fillOpacity: 0.42,
        }),
      }).addTo(map);
      overlayLayers.current.push(fill);
      const halo = L.geoJSON(countriesRef.current, {
        filter: (f: any) => isos.has(f.id),
        interactive: false,
        style: () => ({ color: tagColor, weight: 5, opacity: 0.15, fill: false }),
      }).addTo(map);
      overlayLayers.current.push(halo);
    }

    // ── legal system filter overlay (blended for hybrids) ──
    const legal = legalActive ?? [];
    const subs = legalSubActive ?? [];
    if (legal.length) {
      const styleFor = (f: any) => {
        const iso = f.id;
        const blend = legalBlend(iso, legal, subs);
        if (!blend) return { opacity: 0, fillOpacity: 0, color: "transparent", fillColor: "transparent" };
        const rgb = `rgb(${blend.join(",")})`;
        return { color: rgb, weight: 0.6, opacity: 0.5, fillColor: rgb, fillOpacity: 0.38 };
      };
      const layer = L.geoJSON(countriesRef.current, {
        filter: (f: any) => !!legalBlend(f.id, legal, subs),
        interactive: false,
        style: styleFor,
      }).addTo(map);
      overlayLayers.current.push(layer);
    }
  }, [ready, activeFilters.join("|"), toggles.borders, year, subKey,
      highlightTag?.kind, highlightTag?.tag, (legalActive ?? []).join("|"), (legalSubActive ?? []).join("|"), labelOverrides]);

  return <div ref={ref} className="absolute inset-0 wd-map" />;
}