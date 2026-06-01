let ready = false;
const queued: (() => void)[] = [];

export function ensureLeaflet(cb: () => void) {
  if (ready) return cb();
  queued.push(cb);
  if (document.querySelector("#wandery-leaflet-js")) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.id = "wandery-leaflet-js";
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = () => {
    ready = true;
    queued.forEach(fn => fn());
    queued.length = 0;
  };
  document.head.appendChild(script);
}

const COUNTRIES_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
let countriesPromise: Promise<any> | null = null;
export function loadCountries(): Promise<any> {
  if (!countriesPromise) {
    countriesPromise = fetch(COUNTRIES_URL).then(r => r.json());
  }
  return countriesPromise;
}