
-- Maker profiles for /localnetwork
CREATE TABLE public.maker_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  alias TEXT NOT NULL,
  city TEXT NOT NULL,
  approx_lat DOUBLE PRECISION NOT NULL,
  approx_lng DOUBLE PRECISION NOT NULL,
  service_radius_km INTEGER NOT NULL DEFAULT 10,
  printer_type TEXT NOT NULL,
  machine_model TEXT,
  build_volume TEXT,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolution TEXT,
  max_job_size TEXT,
  turnaround TEXT,
  availability TEXT NOT NULL DEFAULT 'offline',
  fulfillment JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_guidance TEXT,
  portfolio_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  bio TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maker_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved makers
CREATE POLICY "approved makers are public" ON public.maker_profiles
  FOR SELECT USING (approved = true);

-- A user can view their own profile (even if pending)
CREATE POLICY "users view own profile" ON public.maker_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users insert own profile" ON public.maker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own profile" ON public.maker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Fabrication requests
CREATE TABLE public.fab_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID,
  requester_email TEXT,
  job_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  material TEXT,
  urgency TEXT NOT NULL DEFAULT 'standard',
  budget_range TEXT,
  city TEXT NOT NULL,
  zip TEXT,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  file_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  matched_maker_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fab_requests ENABLE ROW LEVEL SECURITY;

-- Requester sees their own; matched maker sees requests routed to them; open requests are visible to approved makers in same city
CREATE POLICY "requester views own" ON public.fab_requests
  FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "approved makers view open requests" ON public.fab_requests
  FOR SELECT USING (
    status = 'open' AND EXISTS (
      SELECT 1 FROM public.maker_profiles mp
      WHERE mp.user_id = auth.uid()
        AND mp.approved = true
        AND mp.city = fab_requests.city
    )
  );

CREATE POLICY "matched maker views" ON public.fab_requests
  FOR SELECT USING (
    matched_maker_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.maker_profiles mp WHERE mp.id = matched_maker_id AND mp.user_id = auth.uid())
  );

-- Anyone (auth or anon) can submit a request
CREATE POLICY "public can submit requests" ON public.fab_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "requester updates own" ON public.fab_requests
  FOR UPDATE USING (auth.uid() = requester_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER maker_profiles_touch
  BEFORE UPDATE ON public.maker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed approved sample makers (no user_id yet — system seeds, will be visible publicly)
-- We allow user_id to be NULL by altering it
ALTER TABLE public.maker_profiles ALTER COLUMN user_id DROP NOT NULL;

INSERT INTO public.maker_profiles
  (alias, city, approx_lat, approx_lng, service_radius_km, printer_type, machine_model, build_volume, materials, turnaround, availability, fulfillment, price_guidance, bio, approved, verified)
VALUES
  -- San Francisco
  ('mission_maker', 'San Francisco', 37.7599, -122.4148, 8, 'FDM', 'Bambu Lab X1 Carbon', '256×256×256mm', '["PLA","PETG","ABS","TPU"]'::jsonb, 'same-day to 2 days', 'available', '["pickup","delivery"]'::jsonb, '$0.15/g + $5 setup', 'mission district, fast prototyping for hardware folks.', true, true),
  ('soma_resin', 'San Francisco', 37.7785, -122.4056, 5, 'Resin', 'Formlabs Form 3+', '145×145×185mm', '["Standard Resin","Tough 2000","Clear"]'::jsonb, '2-4 days', 'available', '["pickup"]'::jsonb, 'quote per part', 'high-detail miniatures and jewelry masters.', true, false),
  ('sunset_cnc', 'San Francisco', 37.7434, -122.4890, 12, 'CNC', 'Shapeoko 4 XXL', '838×838×100mm', '["wood","aluminum","acrylic","HDPE"]'::jsonb, '3-7 days', 'busy', '["pickup","shipping"]'::jsonb, 'starts at $40', 'small-batch signage and brackets.', true, true),
  ('richmond_laser', 'San Francisco', 37.7806, -122.4644, 10, 'Laser Cutter', 'Glowforge Pro', '495×279mm', '["plywood","acrylic","leather","cardboard"]'::jsonb, '24-48 hr', 'available', '["pickup","delivery"]'::jsonb, '$0.50/min', 'badges, prototypes, art pieces.', true, false),
  -- Los Angeles
  ('echo_park_fdm', 'Los Angeles', 34.0780, -118.2606, 15, 'FDM', 'Prusa MK4', '250×210×220mm', '["PLA","PETG","PLA-CF"]'::jsonb, '1-3 days', 'available', '["pickup","delivery","shipping"]'::jsonb, '$0.12/g', 'reliable, no surprises.', true, true),
  ('venice_resin', 'Los Angeles', 33.9850, -118.4695, 10, 'Resin', 'Elegoo Saturn 3', '218×123×260mm', '["ABS-Like","Water Wash"]'::jsonb, '2-3 days', 'available', '["pickup"]'::jsonb, '$8 minimum', 'tabletop figures and dental models.', true, false),
  ('downtown_laser', 'Los Angeles', 34.0407, -118.2468, 12, 'Laser Cutter', 'Epilog Helix 24', '610×457mm', '["acrylic","wood","felt","paper"]'::jsonb, 'same-day capable', 'available', '["pickup"]'::jsonb, '$1/min', 'arts district, fast turnaround.', true, true),
  ('long_beach_cnc', 'Los Angeles', 33.7701, -118.1937, 25, 'CNC', 'Onefinity Woodworker', '813×813×133mm', '["wood","mdf","foam"]'::jsonb, '4-6 days', 'offline', '["pickup","shipping"]'::jsonb, 'project-based', 'furniture parts and architectural models.', true, false),
  -- New York City
  ('bushwick_fdm', 'New York City', 40.6944, -73.9213, 8, 'FDM', 'Bambu Lab P1S', '256×256×256mm', '["PLA","PETG","ABS"]'::jsonb, '1-2 days', 'available', '["pickup","delivery"]'::jsonb, '$0.18/g', 'brooklyn, drop-off welcome.', true, true),
  ('lic_resin', 'New York City', 40.7447, -73.9485, 6, 'Resin', 'Anycubic Mono X 6Ks', '195×122×200mm', '["Standard","Plant-Based"]'::jsonb, '2-4 days', 'available', '["pickup"]'::jsonb, 'quote per part', 'long island city, tabletop and props.', true, false),
  ('chelsea_laser', 'New York City', 40.7465, -74.0014, 5, 'Laser Cutter', 'Trotec Speedy 360', '813×508mm', '["acrylic","wood","leather"]'::jsonb, 'same-day capable', 'busy', '["pickup"]'::jsonb, '$1.25/min', 'fashion samples and signage.', true, true),
  ('queens_cnc', 'New York City', 40.7282, -73.7949, 20, 'CNC', 'Avid PRO 4848', '1219×1219×203mm', '["wood","aluminum","plastic sheet"]'::jsonb, '5-10 days', 'available', '["pickup","shipping"]'::jsonb, 'starts at $80', 'larger format work, can handle batches.', true, false),
  ('soho_vinyl', 'New York City', 40.7233, -74.0030, 4, 'Vinyl Cutter', 'Cricut Maker 3', '305×610mm', '["adhesive vinyl","HTV","cardstock"]'::jsonb, 'same-day', 'available', '["pickup","delivery"]'::jsonb, '$5 minimum', 'stickers, decals, custom apparel.', true, false),
  -- Boston
  ('cambridge_fdm', 'Boston', 42.3736, -71.1097, 10, 'FDM', 'Prusa XL', '360×360×360mm', '["PLA","PETG","ABS","PC"]'::jsonb, '1-3 days', 'available', '["pickup","delivery"]'::jsonb, '$0.14/g', 'near MIT, high quality.', true, true),
  ('somerville_resin', 'Boston', 42.3876, -71.0995, 7, 'Resin', 'Formlabs Form 4', '200×125×210mm', '["Grey Pro","Tough","Castable"]'::jsonb, '2-4 days', 'available', '["pickup"]'::jsonb, 'quote per part', 'jewelry and engineering masters.', true, false),
  ('allston_laser', 'Boston', 42.3539, -71.1337, 8, 'Laser Cutter', 'Boss LS-1416', '356×406mm', '["acrylic","wood","cardboard"]'::jsonb, '24-48 hr', 'available', '["pickup"]'::jsonb, '$0.75/min', 'student-friendly pricing.', true, false),
  ('seaport_cnc', 'Boston', 42.3505, -71.0419, 15, 'CNC', 'Tormach 1100MX', '457×305×406mm', '["aluminum","brass","steel","delrin"]'::jsonb, '5-7 days', 'busy', '["pickup","shipping"]'::jsonb, 'starts at $60', 'metal parts, prototyping shop.', true, true);
