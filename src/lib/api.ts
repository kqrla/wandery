/**
 * api.ts — Supabase-backed API client.
 * Replaces the original Zite SDK calls with direct Supabase queries.
 */

import { supabase } from '@/lib/supabaseExternal';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'Library' | 'Makerspace' | string;
  capabilities: string[];
  membershipCost: string;
  sourceLink: string;
  notes: string;
}

export interface SuggestionPayload {
  locationName: string;
  suggestedChange: string;
  sourceUrl: string;
  notes?: string;
  city?: string;
  address?: string;
  submitterEmail?: string;
  submissionType?: 'suggestion' | 'edit' | 'city';
}

/** Fetch all fabrication locations for a given city. */
export async function fetchLocationsByCity(cityName: string): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('city', cityName)
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchLocationsByCity error:', error);
    return [];
  }

  return (data ?? []).map((r: any) => ({
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    latitude: Number(r.lat ?? 0),
    longitude: Number(r.lng ?? 0),
    type: r.type === 'library' ? 'Library' : 'Makerspace',
    capabilities: Array.isArray(r.capabilities) ? r.capabilities : [],
    membershipCost: String(r.membership_info ?? ''),
    sourceLink: String(r.source_url ?? ''),
    notes: String(r.description ?? ''),
  }));
}

/** Submit a user suggestion for a new or updated location. */
export async function submitLocationSuggestion(
  payload: SuggestionPayload,
): Promise<{ success: boolean }> {
  const { error } = await supabase.from('submissions').insert({
    location_name: payload.locationName,
    suggested_change: payload.suggestedChange,
    source_url: payload.sourceUrl ?? '',
    notes: payload.notes ?? '',
    city: payload.city ?? '',
    address: payload.address ?? '',
    status: 'pending',
    submitter_email: payload.submitterEmail ?? '',
  });
  if (error) console.error('submitLocationSuggestion error:', error);
  return { success: !error };
}