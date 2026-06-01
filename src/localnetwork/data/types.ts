export interface MakerMachine {
  id: string;
  printer_type: string;
  machine_model?: string | null;
  build_volume?: string | null;
  resolution?: string | null;
  max_job_size?: string | null;
  materials: string[];
  supplies?: string | null;
  notes?: string | null;
}

export interface MakerProfile {
  id: string;
  user_id: string | null;
  alias: string;
  city: string;
  zip?: string | null;
  approx_lat: number;
  approx_lng: number;
  service_radius_km: number;
  printer_type: string;
  machine_model: string | null;
  build_volume: string | null;
  materials: string[];
  resolution: string | null;
  max_job_size: string | null;
  turnaround: string | null;
  availability: 'available' | 'busy' | 'offline';
  fulfillment: string[];
  price_guidance: string | null;
  portfolio_urls: string[];
  bio: string | null;
  approved: boolean;
  verified: boolean;
  machines: MakerMachine[];
  capabilities: string[];
  traits: string[];
}

export interface FabRequest {
  id: string;
  requester_id: string | null;
  requester_email: string | null;
  job_type: string;
  title: string;
  description: string | null;
  quantity: number;
  material: string | null;
  urgency: string;
  budget_range: string | null;
  city: string;
  zip: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  file_urls: string[];
  notes: string | null;
  status: string;
  matched_maker_id: string | null;
  created_at: string;
}