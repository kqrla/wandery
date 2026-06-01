import { useState, useEffect, useRef, useMemo } from 'react';
import MapView from '@/components/MapView';
import LocationCard from '@/components/LocationCard';
import LocationDrawer from '@/components/LocationDrawer';
import SuggestModal from '@/components/SuggestModal';
import InfoPanel from '@/components/InfoPanel';
import { Toaster } from '@/components/ui/sonner';
import { Menu, Plus, ZoomIn, ZoomOut, Info, MapPin, X, Palette, ChevronDown, Loader2 } from 'lucide-react';
import { CITIES, type CityConfig } from '@/data/cities';
import type { Location } from '@/lib/api';
import { fetchLocationsByCity } from '@/lib/api';
import { UNIVERSITY_LOCATIONS } from '@/data/universities';

export function toUrlSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Short-code / alias → canonical URL slug
const CITY_ALIASES: Record<string, string> = {
  'sf':            'san-francisco',
  'sanfrancisco':  'san-francisco',
  'la':            'los-angeles',
  'losangeles':    'los-angeles',
  'nyc':           'new-york-city',
  'newyork':       'new-york-city',
  'newyorkcity':   'new-york-city',
  'boston':        'boston',
};

function parseCityFromUrl(allCities: CityConfig[]): CityConfig | null {
  const raw = window.location.pathname.split('/').filter(Boolean)[0];
  if (!raw) return null;
  const slug = CITY_ALIASES[raw.toLowerCase()] ?? raw.toLowerCase();
  return allCities.find(c => toUrlSlug(c.name) === slug) ?? null;
}

function parseZipFromUrl(): string {
  return window.location.pathname.split('/').filter(Boolean)[1] ?? '';
}

const CAPABILITIES = [
  '3D Printing', 'Resin Printing', 'Laser Cutting', 'CNC',
  'PCB', 'Vinyl Cutting / Cricut', 'Electronics', 'Woodworking', 'Sewing',
];

type Theme = 'default' | 'pink' | 'sage';
// default = cherry & thistle, pink = peachy seashell, sage = warm cream
const THEME_CYCLE: Theme[] = ['default', 'pink', 'sage'];

function toHashtag(capability: string) {
  return '#' + capability.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function haversineDistanceKm(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapButton({
  onClick,
  children,
  active,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 border border-foreground/70 backdrop-blur-sm flex items-center justify-center transition-colors ${
        active ? 'bg-foreground text-background' : 'bg-background/90 hover:bg-background'
      }`}
    >
      {children}
    </button>
  );
}

const isSeedMode = new URLSearchParams(window.location.search).get('seed') === '1';

export default function MapApp() {
  const [customCities, setCustomCities] = useState<CityConfig[]>(() => {
    try { return JSON.parse(localStorage.getItem('fab-custom-cities') ?? '[]'); } catch { return []; }
  });

  const [activeCity, setActiveCity] = useState<CityConfig>(() => {
    const stored: CityConfig[] = (() => {
      try { return JSON.parse(localStorage.getItem('fab-custom-cities') ?? '[]'); } catch { return []; }
    })();
    const allCities = [...CITIES, ...stored];
    return parseCityFromUrl(allCities) ?? allCities.find(c => c.id === (localStorage.getItem('fab-city') ?? 'sf')) ?? CITIES[0];
  });

  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [cityInputOpen, setCityInputOpen] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [cityGeocodingLoading, setCityGeocodingLoading] = useState(false);
  const [cityGeocodingError, setCityGeocodingError] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<{ location: Location; x: number; y: number } | null>(null);
  const [drawerLocation, setDrawerLocation] = useState<Location | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [activeCapabilities, setActiveCapabilities] = useState<Set<string>>(new Set());
  const [zipInputValue, setZipInputValue] = useState('');
  const [activeZipCode, setActiveZipCode] = useState(() => parseZipFromUrl());
  const [zipSearchOpen, setZipSearchOpen] = useState(false);
  const [zipErrorMessage, setZipErrorMessage] = useState('');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('fab-theme') as Theme;
    return (['default', 'pink', 'sage'] as Theme[]).includes(saved) ? saved : 'default';
  });
  const [uniModeEnabled, setUniModeEnabled] = useState(
    () => localStorage.getItem('fab-uni-mode') === 'true'
  );
  const [selectedUniversityId, setSelectedUniversityId] = useState(
    () => localStorage.getItem('fab-uni-id') ?? ''
  );

  const mapRef = useRef<any>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('theme-pink', 'theme-sage');
    if (theme !== 'default') html.classList.add(`theme-${theme}`);
    localStorage.setItem('fab-theme', theme);
  }, [theme]);

  // Dismiss right-click pin on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setContextMenuPos(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLocationsLoading(true);
    setLocations([]);
    fetchLocationsByCity(activeCity.name)
      .then(data => {
        if (!cancelled) { setLocations(data); setLocationsLoading(false); }
      })
      .catch(() => { if (!cancelled) setLocationsLoading(false); });
    return () => { cancelled = true; };
  }, [activeCity.name]);

  useEffect(() => {
    function handlePopState() {
      const allCities = [...CITIES, ...customCities];
      const city = parseCityFromUrl(allCities);
      const zip = parseZipFromUrl();
      if (city) {
        setActiveCity(city);
        setActiveZipCode(zip);
        setActiveCapabilities(new Set());
        mapRef.current?.setView(zip && city.zips[zip] ? city.zips[zip] : city.center, zip && city.zips[zip] ? 15 : city.zoom);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [customCities]);

  function switchCity(city: CityConfig) {
    setActiveCity(city);
    setCityMenuOpen(false);
    setSelectedPin(null);
    setDrawerOpen(false);
    setActiveZipCode('');
    setZipInputValue('');
    setActiveCapabilities(new Set());
    localStorage.setItem('fab-city', city.id);
    mapRef.current?.setView(city.center, city.zoom);
    history.pushState({}, '', `/${toUrlSlug(city.name)}`);
  }

  function cycleTheme() {
    setTheme(current => {
      const idx = THEME_CYCLE.indexOf(current);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    });
  }

  function toggleCapabilityFilter(capability: string) {
    setActiveCapabilities(prev => {
      const next = new Set(prev);
      next.has(capability) ? next.delete(capability) : next.add(capability);
      return next;
    });
  }

  function openDrawerForLocation() {
    if (!selectedPin) return;
    setDrawerLocation(selectedPin.location);
    setDrawerOpen(true);
    setSelectedPin(null);
  }

  function applyZipFilter() {
    const zip = zipInputValue.trim();
    if (!activeCity.zips[zip]) {
      setZipErrorMessage(`Not a valid ZIP for ${activeCity.name}.`);
      return;
    }
    setZipErrorMessage('');
    setActiveZipCode(zip);
    const [lat, lng] = activeCity.zips[zip];
    mapRef.current?.setView([lat, lng], 15);
    setZipSearchOpen(false);
    setSelectedPin(null);
    history.pushState({}, '', `/${toUrlSlug(activeCity.name)}/${zip}`);
  }

  function clearZipFilter() {
    setActiveZipCode('');
    setZipInputValue('');
    history.pushState({}, '', `/${toUrlSlug(activeCity.name)}`);
  }

  async function handleAddCustomCity() {
    const cityName = citySearchText.trim();
    if (!cityName) return;
    setCityGeocodingLoading(true);
    setCityGeocodingError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ', USA')}&format=json&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en-US' } }
      );
      const results = await res.json();
      if (!results?.length) {
        setCityGeocodingError('City not found. Try "Austin, TX" format.');
        return;
      }
      const { lat, lon, address } = results[0];
      const shortName = address?.city || address?.town || address?.county || cityName;
      const newCity: CityConfig = {
        id: shortName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: shortName,
        center: [parseFloat(lat), parseFloat(lon)],
        zoom: 13,
        zips: {},
      };
      const updated = [...customCities.filter(c => c.id !== newCity.id), newCity];
      setCustomCities(updated);
      localStorage.setItem('fab-custom-cities', JSON.stringify(updated));
      switchCity(newCity);
      setCityInputOpen(false);
      setCitySearchText('');
    } catch {
      setCityGeocodingError('Search failed. Please try again.');
    } finally {
      setCityGeocodingLoading(false);
    }
  }

  function handleUniModeChange(enabled: boolean) {
    setUniModeEnabled(enabled);
    localStorage.setItem('fab-uni-mode', String(enabled));
    if (!enabled) setSelectedUniversityId('');
  }

  function handleUniversityChange(universityId: string) {
    setSelectedUniversityId(universityId);
    localStorage.setItem('fab-uni-id', universityId);
  }

  const filteredLocations = useMemo(() => {
    let result = locations;
    if (activeCapabilities.size > 0) {
      result = result.filter(loc => loc.capabilities.some(cap => activeCapabilities.has(cap)));
    }
    if (activeZipCode) {
      const zipCenter = activeCity.zips[activeZipCode];
      if (zipCenter) {
        result = result.filter(loc =>
          haversineDistanceKm(zipCenter, [loc.latitude, loc.longitude]) <= 2.5
        );
      }
    }
    return result;
  }, [locations, activeCity, activeCapabilities, activeZipCode]);

  const universityLocations = useMemo<Location[]>(() => {
    if (!uniModeEnabled || !selectedUniversityId) return [];
    return UNIVERSITY_LOCATIONS
      .filter(loc => loc.universityId === selectedUniversityId)
      .map(({ universityId: _id, ...rest }) => rest as Location);
  }, [uniModeEnabled, selectedUniversityId]);

  const allVisibleLocations = useMemo(
    () => [...filteredLocations, ...universityLocations],
    [filteredLocations, universityLocations]
  );

  return (
    <div
      className="w-screen h-screen overflow-hidden relative bg-background"
      onClick={() => setCityMenuOpen(false)}
    >
      <MapView
        locations={allVisibleLocations}
        initialCenter={activeCity.center}
        initialZoom={activeCity.zoom}
        theme={theme}
        onMarkerClick={(location, x, y) => {
          setDrawerOpen(false);
          setSelectedPin({ location, x, y });
        }}
        onMapClick={() => {
          setSelectedPin(null);
          setCityMenuOpen(false);
          setContextMenuPos(null);
        }}
        onContextMenu={(x, y) => setContextMenuPos({ x, y })}
        onReady={map => {
          mapRef.current = map;
          if (activeZipCode && activeCity.zips[activeZipCode]) {
            const [lat, lng] = activeCity.zips[activeZipCode];
            map.setView([lat, lng], 15);
          }
        }}
      />

      {/* Top-left controls — hidden while any panel is open */}
      {!infoPanelOpen && !drawerOpen && (
        <div className="absolute top-4 left-4 z-[1001] flex flex-col -space-y-px">
          <MapButton onClick={() => setInfoPanelOpen(true)}>
            <Menu size={17} strokeWidth={1.8} />
          </MapButton>
          <MapButton onClick={cycleTheme} active={theme !== 'default'}>
            <Palette size={15} strokeWidth={1.8} />
          </MapButton>
        </div>
      )}

      {/* Title and city picker */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] text-center"
        onClick={e => e.stopPropagation()}
      >
        <h1
          className="font-black uppercase leading-none tracking-tight text-foreground select-none pointer-events-none"
          style={{ fontSize: '1.3rem' }}
        >
          fabnetwork
        </h1>

        <div className="relative mt-1 flex justify-center">
          <button
            onClick={() => setCityMenuOpen(open => !open)}
            className="flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase text-foreground/50 hover:text-foreground/80 transition-colors bg-background/80 backdrop-blur-sm border border-border/60 rounded-full px-2.5 py-1"
          >
            {activeCity.name}
            <ChevronDown size={9} className={`transition-transform ${cityMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {cityMenuOpen && (
            <div
              className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[180px] z-[1002]"
              onClick={e => e.stopPropagation()}
            >
              {CITIES.map(city => (
                <button key={city.id} onClick={() => switchCity(city)}
                  className={`w-full px-4 py-2 text-xs text-left transition-colors ${
                    city.id === activeCity.id
                      ? 'font-semibold text-foreground bg-muted'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}>
                  {city.name}
                </button>
              ))}

              {customCities.length > 0 && (
                <>
                  <div className="mx-3 my-1 border-t border-border" />
                  <p className="px-4 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Community</p>
                  {customCities.map(city => (
                    <button key={city.id} onClick={() => switchCity(city)}
                      className={`w-full px-4 py-2 text-xs text-left transition-colors ${
                        city.id === activeCity.id
                          ? 'font-semibold text-foreground bg-muted'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}>
                      {city.name}
                    </button>
                  ))}
                </>
              )}

              <div className="mx-3 my-1 border-t border-border" />
              {cityInputOpen ? (
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Add a US city</p>
                  <input
                    autoFocus
                    value={citySearchText}
                    onChange={e => { setCitySearchText(e.target.value); setCityGeocodingError(''); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddCustomCity();
                      if (e.key === 'Escape') { setCityInputOpen(false); setCityGeocodingError(''); }
                    }}
                    placeholder="e.g. Austin, TX"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground outline-none focus:ring-1 focus:ring-foreground/20 font-mono"
                  />
                  {cityGeocodingLoading && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Loader2 size={9} className="animate-spin" /> Searching
                    </p>
                  )}
                  {cityGeocodingError && <p className="text-[10px] text-destructive">{cityGeocodingError}</p>}
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={() => { setCityInputOpen(false); setCityGeocodingError(''); setCitySearchText(''); }}
                      className="flex-1 text-[10px] text-muted-foreground hover:text-foreground py-1 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomCity}
                      disabled={!citySearchText.trim() || cityGeocodingLoading}
                      className="flex-1 text-[10px] font-semibold bg-foreground text-background rounded-md py-1.5 disabled:opacity-40 transition-opacity"
                    >
                      Add city
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCityInputOpen(true)}
                  className="w-full px-4 py-2 text-xs text-left text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors italic"
                >
                  + Other US city
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suggest button (top right) — hidden while any panel is open */}
      {!drawerOpen && !infoPanelOpen && (
        <div className="absolute top-4 right-4 z-[1001]">
          <MapButton onClick={() => setSuggestOpen(true)}>
            <Plus size={18} strokeWidth={1.8} />
          </MapButton>
        </div>
      )}

      {/* Zoom + info (bottom right) — hidden while any panel is open */}
      {!infoPanelOpen && !drawerOpen && (
      <div className="absolute bottom-8 right-4 z-[1001] flex flex-col -space-y-px">
        <MapButton onClick={() => mapRef.current?.zoomIn()}>
          <ZoomIn size={15} strokeWidth={1.8} />
        </MapButton>
        <MapButton onClick={() => mapRef.current?.zoomOut()}>
          <ZoomOut size={15} strokeWidth={1.8} />
        </MapButton>
        <MapButton onClick={() => setInfoPanelOpen(true)}>
          <Info size={15} strokeWidth={1.8} />
        </MapButton>
      </div>
      )}

      {/* ZIP search (bottom left) — hidden while any panel is open */}
      {!infoPanelOpen && !drawerOpen && (
      <div className="absolute bottom-8 left-4 z-[1001] flex flex-col items-start gap-2">
        {zipSearchOpen && (
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg w-52">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Search by ZIP code
            </p>
            <div className="flex gap-1.5">
              <input
                className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-foreground/20 font-mono bg-background text-foreground"
                placeholder={`e.g. ${Object.keys(activeCity.zips)[0] ?? '94110'}`}
                value={zipInputValue}
                onChange={e => { setZipInputValue(e.target.value); setZipErrorMessage(''); }}
                onKeyDown={e => e.key === 'Enter' && applyZipFilter()}
                maxLength={5}
                autoFocus
              />
              <button
                onClick={applyZipFilter}
                className="bg-foreground text-background rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
              >
                Go
              </button>
            </div>
            {zipErrorMessage && (
              <p className="text-[10px] text-destructive mt-1.5">{zipErrorMessage}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <MapButton onClick={() => { setZipSearchOpen(open => !open); setZipErrorMessage(''); }}>
            <MapPin size={15} strokeWidth={1.8} className={activeZipCode ? 'text-primary' : ''} />
          </MapButton>
          {activeZipCode && (
            <div className="flex items-center gap-1.5 bg-foreground text-background rounded-full px-2.5 py-1 text-xs font-semibold">
              {activeZipCode}
              <button onClick={clearZipFilter}>
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Loading state */}
      {locationsLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-xl px-4 py-2.5 text-xs text-muted-foreground font-medium shadow">
            Loading locations
          </div>
        </div>
      )}

      {/* Empty state */}
      {!locationsLoading && filteredLocations.length === 0 && locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-2xl px-6 py-5 text-center max-w-xs shadow-lg">
            <p className="font-semibold text-foreground mb-1">{activeCity.name} is coming soon</p>
            <p className="text-xs text-muted-foreground">
              Know a makerspace or library with fab equipment here?
            </p>
            <button
              onClick={() => setSuggestOpen(true)}
              className="mt-3 pointer-events-auto text-xs font-semibold underline underline-offset-2 text-foreground/70 hover:text-foreground"
            >
              Suggest a place
            </button>
          </div>
        </div>
      )}

      {/* Active filters badge */}
      {activeCapabilities.size > 0 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <div className="bg-foreground/90 text-background backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold whitespace-nowrap">
            {activeCapabilities.size} filter{activeCapabilities.size > 1 ? 's' : ''} active
          </div>
        </div>
      )}

      {/* Capability filter chips — hidden when any panel or suggest form is open */}
      {!infoPanelOpen && !suggestOpen && !drawerOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-[998] pointer-events-none">
          <div className="pointer-events-auto px-3 pb-3 pt-2">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              {CAPABILITIES.map(capability => {
                const isActive = activeCapabilities.has(capability);
                return (
                  <button
                    key={capability}
                    onClick={() => toggleCapabilityFilter(capability)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background/88 backdrop-blur-sm text-foreground/70 border-border hover:border-foreground/40'
                    }`}
                  >
                    {toHashtag(capability)}
                  </button>
                );
              })}
              {activeCapabilities.size > 0 && (
                <button
                  onClick={() => setActiveCapabilities(new Set())}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border border-destructive/50 text-destructive bg-background/88 backdrop-blur-sm hover:bg-destructive/10 transition-all whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pin popup */}
      {selectedPin && (
        <LocationCard
          location={selectedPin.location}
          x={selectedPin.x}
          y={selectedPin.y}
          onClose={() => setSelectedPin(null)}
          onTagClick={toggleCapabilityFilter}
          onMoreInfo={openDrawerForLocation}
          selectedCaps={activeCapabilities}
          zIndex={suggestOpen ? 40 : 1001}
        />
      )}

      <LocationDrawer
        location={drawerLocation}
        open={drawerOpen}
        city={activeCity.name}
        onClose={() => setDrawerOpen(false)}
        onTagClick={toggleCapabilityFilter}
        selectedCaps={activeCapabilities}
      />

      <InfoPanel
        open={infoPanelOpen}
        onClose={() => setInfoPanelOpen(false)}
        onSuggest={() => { setInfoPanelOpen(false); setSuggestOpen(true); }}
        currentCity={activeCity.name}
        uniModeEnabled={uniModeEnabled}
        selectedUniversityId={selectedUniversityId}
        onUniModeChange={handleUniModeChange}
        onUniversityChange={handleUniversityChange}
      />

      {/* Right-click "add place" pin — appears at cursor, Queering the Map style */}
      {contextMenuPos && (
        <button
          onClick={() => { setContextMenuPos(null); setSuggestOpen(true); }}
          className="fab-add-pin"
          style={{ left: contextMenuPos.x - 22, top: contextMenuPos.y - 56 }}
          title="Suggest a place here"
        >
          <svg viewBox="0 0 44 58" width="44" height="58" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="22" cy="56" rx="7" ry="3" fill="rgba(0,0,0,0.22)" />
            <path d="M22 1C10.402 1 1 10.402 1 22C1 36 22 56 22 56C22 56 43 36 43 22C43 10.402 33.598 1 22 1Z" fill="hsl(336,72%,56%)" />
            <ellipse cx="15" cy="14" rx="8" ry="5.5" fill="rgba(255,255,255,0.22)" />
            <circle cx="22" cy="22" r="12" fill="rgba(255,255,255,0.92)" />
            <line x1="22" y1="16" x2="22" y2="28" stroke="hsl(336,72%,48%)" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="16" y1="22" x2="28" y2="22" stroke="hsl(336,72%,48%)" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <SuggestModal open={suggestOpen} onClose={() => setSuggestOpen(false)} city={activeCity.name} />
      <Toaster position="top-center" />
    </div>
  );
}
