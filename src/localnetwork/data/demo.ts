import type { MakerProfile, FabRequest } from './types';

export const DEMO_MAKER: MakerProfile = {
  id: 'demo-maker-001',
  user_id: 'demo-user',
  alias: 'demo_maker',
  city: 'San Francisco',
  zip: '94110',
  approx_lat: 37.7599,
  approx_lng: -122.4148,
  service_radius_km: 12,
  printer_type: 'FDM',
  machine_model: 'Bambu X1C',
  build_volume: '256×256×256mm',
  materials: ['PLA', 'PETG', 'PLA-CF', 'TPU'],
  resolution: '0.1mm',
  max_job_size: '256mm',
  turnaround: '1-3 days, same-day capable',
  availability: 'available',
  fulfillment: ['pickup', 'delivery'],
  price_guidance: '$0.20/g + setup',
  portfolio_urls: [],
  bio: 'demo profile — explore the dashboard without signing up.',
  approved: true,
  verified: true,
  machines: [
    { id: 'm1', printer_type: 'FDM', machine_model: 'Bambu X1C', build_volume: '256×256×256mm', resolution: '0.1mm', max_job_size: '256mm', materials: ['PLA','PETG','PLA-CF'], supplies: '5kg PLA in stock', notes: 'AMS for multicolor' },
    { id: 'm2', printer_type: 'Resin', machine_model: 'Elegoo Saturn 3', build_volume: '218×123×250mm', resolution: '0.05mm', max_job_size: '218mm', materials: ['Standard Resin','Tough'], supplies: '1L grey resin', notes: '' },
  ],
  capabilities: ['3D Printing','Resin Printing','Electronics'],
  traits: ['quick prototyping','multicolor / multimaterial','precision','hobby friendly'],
};

export const DEMO_INCOMING: FabRequest[] = [
  {
    id: 'demo-req-1', requester_id: null, requester_email: 'alex@example.com',
    job_type: 'FDM', title: 'enclosure for usb hub', description: 'small box, ~80×40×20mm',
    quantity: 2, material: 'PETG', urgency: 'standard', budget_range: '$15-30',
    city: 'San Francisco', zip: '94110', pickup_lat: null, pickup_lng: null,
    file_urls: ['hub_enclosure.stl'], notes: '', status: 'open',
    matched_maker_id: 'demo-maker-001', created_at: new Date(Date.now()-3600e3).toISOString(),
  },
  {
    id: 'demo-req-2', requester_id: null, requester_email: 'sam@example.com',
    job_type: 'Resin', title: 'mini gear set (10 parts)', description: 'modular, tight tolerances',
    quantity: 10, material: 'Tough', urgency: 'rush', budget_range: '$40-80',
    city: 'San Francisco', zip: '94114', pickup_lat: null, pickup_lng: null,
    file_urls: [], notes: 'tolerances ±0.1mm', status: 'open',
    matched_maker_id: 'demo-maker-001', created_at: new Date(Date.now()-7200e3).toISOString(),
  },
];

export const DEMO_OPEN: FabRequest[] = [
  ...DEMO_INCOMING,
  {
    id: 'demo-req-3', requester_id: null, requester_email: 'jay@example.com',
    job_type: 'FDM', title: 'replacement knob', description: '', quantity: 1, material: 'PLA',
    urgency: 'flexible', budget_range: '$5-10', city: 'San Francisco', zip: '94117',
    pickup_lat: null, pickup_lng: null, file_urls: ['knob.step'], notes: '',
    status: 'open', matched_maker_id: null, created_at: new Date(Date.now()-86400e3).toISOString(),
  },
];

export const DEMO_REQUESTER_HISTORY: FabRequest[] = [
  {
    id: 'demo-r-1', requester_id: 'demo-requester', requester_email: 'me@example.com',
    job_type: 'FDM', title: 'phone stand v2', description: 'angled, weighted base',
    quantity: 1, material: 'PETG', urgency: 'standard', budget_range: '$10-20',
    city: 'San Francisco', zip: '94110', pickup_lat: null, pickup_lng: null,
    file_urls: ['stand_v2.stl'], notes: '', status: 'completed',
    matched_maker_id: 'demo-maker-001', created_at: new Date(Date.now()-7*86400e3).toISOString(),
  },
  {
    id: 'demo-r-2', requester_id: 'demo-requester', requester_email: 'me@example.com',
    job_type: 'Laser Cutter', title: 'plywood drawer dividers', description: '',
    quantity: 4, material: 'plywood', urgency: 'standard', budget_range: '$25-40',
    city: 'San Francisco', zip: '94110', pickup_lat: null, pickup_lng: null,
    file_urls: ['dividers.svg'], notes: '', status: 'in_progress',
    matched_maker_id: null, created_at: new Date(Date.now()-2*86400e3).toISOString(),
  },
  {
    id: 'demo-r-3', requester_id: 'demo-requester', requester_email: 'me@example.com',
    job_type: 'Resin', title: 'tabletop minis (5)', description: 'detailed minis',
    quantity: 5, material: 'Standard Resin', urgency: 'flexible', budget_range: '$30-50',
    city: 'San Francisco', zip: '94110', pickup_lat: null, pickup_lng: null,
    file_urls: [], notes: '', status: 'open', matched_maker_id: null,
    created_at: new Date(Date.now()-3600e3).toISOString(),
  },
];