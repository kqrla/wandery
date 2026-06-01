import { useEffect, useRef, useState } from 'react';
import type { MakerProfile } from '@/localnetwork/data/types';

const TILE_VOYAGER = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

const PIN_COLORS: Record<string, string> = {
  'FDM':           '#A888C4',
  'Resin':         '#C87088',
  'CNC':           '#C49070',
  'Laser Cutter':  '#8AADBD',
  'Vinyl Cutter':  '#C47860',
  'Other':         '#9D8189',
};

const STATUS_DOT: Record<string, string> = {
  available: '#5CB85C',
  busy:      '#E0A458',
  offline:   '#999999',
};

let leafletReady = false;
const cbs: (() => void)[] = [];
function ensureLeaflet(cb: () => void) {
  if (leafletReady) return cb();
  cbs.push(cb);
  if (document.querySelector('#leaflet-js')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css'; link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  const s = document.createElement('script');
  s.id = 'leaflet-js'; s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  s.onload = () => { leafletReady = true; cbs.forEach(f => f()); cbs.length = 0; };
  document.head.appendChild(s);
}

function buildPin(printerType: string, availability: string) {
  const color = PIN_COLORS[printerType] ?? '#9D8189';
  const dot = STATUS_DOT[availability] ?? '#999';
  return `<svg viewBox="0 0 40 54" width="38" height="52" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="52" rx="6" ry="2.5" fill="rgba(0,0,0,0.18)"/>
    <path d="M20 1C9.5 1 1 9.5 1 20c0 13 19 32 19 32s19-19 19-32C39 9.5 30.5 1 20 1Z" fill="${color}"/>
    <ellipse cx="14" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.18)"/>
    <circle cx="20" cy="20" r="11" fill="#F5EADC"/>
    <circle cx="20" cy="20" r="5" fill="${color}"/>
    <circle cx="29" cy="11" r="4.5" fill="${dot}" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

function buildRadiusCircle(L: any, lat: number, lng: number, radiusKm: number, color: string) {
  return L.circle([lat, lng], {
    radius: radiusKm * 1000,
    color, weight: 1, opacity: 0.4, fillColor: color, fillOpacity: 0.06,
  });
}

interface Props {
  makers: MakerProfile[];
  center: [number, number];
  zoom: number;
  highlightedId?: string | null;
  onMarkerClick: (m: MakerProfile, x: number, y: number) => void;
  onMapClick: () => void;
  onReady?: (map: any) => void;
}

export default function NetworkMap({ makers, center, zoom, highlightedId, onMarkerClick, onMapClick, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const handlersRef = useRef({ onMarkerClick, onMapClick, onReady });
  const [ready, setReady] = useState(leafletReady);

  useEffect(() => { handlersRef.current = { onMarkerClick, onMapClick, onReady }; });

  useEffect(() => {
    ensureLeaflet(() => {
      setReady(true);
      if (mapRef.current || !containerRef.current) return;
      const L = (window as any).L;
      const map = L.map(containerRef.current, { center, zoom, zoomControl: false });
      L.tileLayer(TILE_VOYAGER, { maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(map);
      map.on('click', () => handlersRef.current.onMapClick());
      mapRef.current = map;
      handlersRef.current.onReady?.(map);
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;
    layersRef.current.forEach(l => l.remove());
    layersRef.current = [];

    makers.forEach(m => {
      const color = PIN_COLORS[m.printer_type] ?? '#9D8189';
      // Service radius
      if (highlightedId === m.id) {
        const c = buildRadiusCircle(L, m.approx_lat, m.approx_lng, m.service_radius_km, color);
        c.addTo(map);
        layersRef.current.push(c);
      }
      const icon = L.divIcon({
        className: '',
        html: buildPin(m.printer_type, m.availability),
        iconSize: [38, 52], iconAnchor: [19, 50],
      });
      const marker = L.marker([m.approx_lat, m.approx_lng], { icon });
      marker.bindTooltip(
        `<div class="fab-tt-name">${m.alias}</div><div class="fab-tt-type">${m.printer_type} · ${m.availability}</div>`,
        { direction: 'top', offset: [0, -50], className: 'fab-hover-tooltip' }
      );
      marker.on('click', (e: any) => {
        e.originalEvent?.stopPropagation();
        const pt = map.latLngToContainerPoint([m.approx_lat, m.approx_lng]);
        handlersRef.current.onMarkerClick(m, pt.x, pt.y);
      });
      marker.addTo(map);
      layersRef.current.push(marker);
    });
  }, [makers, ready, highlightedId]);

  return <div ref={containerRef} className="w-full h-full" />;
}