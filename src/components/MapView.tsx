import { useEffect, useRef, useState } from 'react';
import type { Location } from '@/data/locations';

interface Props {
  locations: Location[];
  initialCenter?: [number, number];
  initialZoom?: number;
  theme?: 'default' | 'pink' | 'sage';
  onMarkerClick: (location: Location, x: number, y: number) => void;
  onMapClick: () => void;
  onContextMenu?: (x: number, y: number) => void;
  onReady?: (map: any) => void;
}

// All themes use Voyager (warm beige land, green parks, blue water).
// Color tinting is done entirely via CSS filters in index.css.
const TILE_VOYAGER = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

// Pin colours per theme — no teal anywhere
const THEME_PINS: Record<string, Record<string, string>> = {
  // default = cherry & thistle
  default: {
    Library:    '#A888C4',
    Makerspace: '#C87088',
    University: '#C49070',
  },
  // pink = peachy seashell
  pink: {
    Library:    '#8AADBD',
    Makerspace: '#CC7260',
    University: '#C48040',
  },
  // sage = warm cream/chestnut, no teal
  sage: {
    Library:    '#A87890',
    Makerspace: '#C47860',
    University: '#C4A060',
  },
};

const BOOK_SVG       = `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`;
const WRENCH_SVG     = `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`;
const GRADUATION_SVG = `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`;

let leafletReady = false;
const readyCallbacks: (() => void)[] = [];

function ensureLeaflet(cb: () => void) {
  if (leafletReady) { cb(); return; }
  readyCallbacks.push(cb);
  if (document.querySelector('#leaflet-js')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css'; link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  const script = document.createElement('script'); script.id = 'leaflet-js';
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = () => { leafletReady = true; readyCallbacks.forEach(fn => fn()); readyCallbacks.length = 0; };
  document.head.appendChild(script);
}

function buildPinSvg(type: string, theme: string) {
  const palette = THEME_PINS[theme] ?? THEME_PINS.default;
  const color = palette[type] ?? '#9D8189';
  const icon = type === 'Library' ? BOOK_SVG : type === 'University' ? GRADUATION_SVG : WRENCH_SVG;
  return `<svg viewBox="0 0 40 54" width="40" height="54" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="52" rx="6" ry="2.5" fill="rgba(0,0,0,0.18)"/>
    <path d="M20 1C9.507 1 1 9.507 1 20C1 33 20 52 20 52C20 52 39 33 39 20C39 9.507 30.493 1 20 1Z" fill="${color}"/>
    <ellipse cx="14" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.18)"/>
    <circle cx="20" cy="20" r="11" fill="#F5EADC"/>
    <g transform="translate(13,13) scale(0.583)" stroke="#3D2018" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none">${icon}</g>
  </svg>`;
}

function makeIcon(L: any, type: string, theme: string) {
  return L.divIcon({ className: '', html: buildPinSvg(type, theme), iconSize: [40, 54], iconAnchor: [20, 52] });
}

export default function MapView({ locations, initialCenter, initialZoom, theme = 'default', onMarkerClick, onMapClick, onContextMenu, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const onMapClickRef = useRef(onMapClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onContextMenuRef = useRef(onContextMenu);
  const onReadyRef = useRef(onReady);
  const [leafletLoaded, setLeafletLoaded] = useState(leafletReady);

  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  useEffect(() => { onMarkerClickRef.current = onMarkerClick; }, [onMarkerClick]);
  useEffect(() => { onContextMenuRef.current = onContextMenu; }, [onContextMenu]);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  // Initialize map
  useEffect(() => {
    ensureLeaflet(() => {
      setLeafletLoaded(true);
      if (mapRef.current || !containerRef.current) return;
      const L = (window as any).L;
      const map = L.map(containerRef.current, {
        center: initialCenter ?? [37.762, -122.435],
        zoom: initialZoom ?? 13,
        zoomControl: false,
      });
      L.tileLayer(TILE_VOYAGER, {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = null; // tile URL is static now, no need to swap
      map.on('click', () => onMapClickRef.current());
      map.on('contextmenu', (e: any) => {
        e.originalEvent.preventDefault();
        onContextMenuRef.current?.(e.originalEvent.clientX, e.originalEvent.clientY);
      });
      mapRef.current = map;
      onReadyRef.current?.(map);
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Update markers when theme or locations change
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    locations.forEach(loc => {
      if (loc.latitude == null || loc.longitude == null) return;
      const marker = L.marker([loc.latitude, loc.longitude], { icon: makeIcon(L, loc.type ?? '', theme) });
      marker.bindTooltip(
        `<div class="fab-tt-name">${loc.name ?? ''}</div><div class="fab-tt-type">${loc.type ?? ''}</div>`,
        { direction: 'top', offset: [0, -52], className: 'fab-hover-tooltip', sticky: false }
      );
      marker.on('click', (e: any) => {
        e.originalEvent?.stopPropagation();
        const pt = map.latLngToContainerPoint([loc.latitude, loc.longitude]);
        onMarkerClickRef.current(loc, pt.x, pt.y);
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [locations, leafletLoaded, theme]);

  return <div ref={containerRef} className="w-full h-full" />;
}
