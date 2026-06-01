export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      fab_requests: {
        Row: {
          budget_range: string | null
          city: string
          created_at: string
          description: string | null
          file_urls: Json
          id: string
          job_type: string
          matched_maker_id: string | null
          material: string | null
          notes: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          quantity: number
          requester_email: string | null
          requester_id: string | null
          status: string
          title: string
          urgency: string
          zip: string | null
        }
        Insert: {
          budget_range?: string | null
          city: string
          created_at?: string
          description?: string | null
          file_urls?: Json
          id?: string
          job_type: string
          matched_maker_id?: string | null
          material?: string | null
          notes?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          quantity?: number
          requester_email?: string | null
          requester_id?: string | null
          status?: string
          title: string
          urgency?: string
          zip?: string | null
        }
        Update: {
          budget_range?: string | null
          city?: string
          created_at?: string
          description?: string | null
          file_urls?: Json
          id?: string
          job_type?: string
          matched_maker_id?: string | null
          material?: string | null
          notes?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          quantity?: number
          requester_email?: string | null
          requester_id?: string | null
          status?: string
          title?: string
          urgency?: string
          zip?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          capabilities: Json
          city: string
          created_at: string
          description: string | null
          id: number
          lat: number
          lng: number
          membership_info: string | null
          name: string
          source_url: string | null
          type: string
        }
        Insert: {
          capabilities?: Json
          city: string
          created_at?: string
          description?: string | null
          id?: never
          lat: number
          lng: number
          membership_info?: string | null
          name: string
          source_url?: string | null
          type: string
        }
        Update: {
          capabilities?: Json
          city?: string
          created_at?: string
          description?: string | null
          id?: never
          lat?: number
          lng?: number
          membership_info?: string | null
          name?: string
          source_url?: string | null
          type?: string
        }
        Relationships: []
      }
      maker_profiles: {
        Row: {
          alias: string
          approved: boolean
          approx_lat: number
          approx_lng: number
          availability: string
          bio: string | null
          build_volume: string | null
          capabilities: Json
          city: string
          created_at: string
          fulfillment: Json
          id: string
          machine_model: string | null
          machines: Json
          materials: Json
          max_job_size: string | null
          portfolio_urls: Json
          price_guidance: string | null
          printer_type: string
          resolution: string | null
          service_radius_km: number
          traits: Json
          turnaround: string | null
          updated_at: string
          user_id: string | null
          verified: boolean
          zip: string | null
        }
        Insert: {
          alias: string
          approved?: boolean
          approx_lat: number
          approx_lng: number
          availability?: string
          bio?: string | null
          build_volume?: string | null
          capabilities?: Json
          city: string
          created_at?: string
          fulfillment?: Json
          id?: string
          machine_model?: string | null
          machines?: Json
          materials?: Json
          max_job_size?: string | null
          portfolio_urls?: Json
          price_guidance?: string | null
          printer_type: string
          resolution?: string | null
          service_radius_km?: number
          traits?: Json
          turnaround?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          zip?: string | null
        }
        Update: {
          alias?: string
          approved?: boolean
          approx_lat?: number
          approx_lng?: number
          availability?: string
          bio?: string | null
          build_volume?: string | null
          capabilities?: Json
          city?: string
          created_at?: string
          fulfillment?: Json
          id?: string
          machine_model?: string | null
          machines?: Json
          materials?: Json
          max_job_size?: string | null
          portfolio_urls?: Json
          price_guidance?: string | null
          printer_type?: string
          resolution?: string | null
          service_radius_km?: number
          traits?: Json
          turnaround?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          zip?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          location_name: string
          notes: string | null
          source_url: string | null
          status: string
          submitter_email: string | null
          suggested_change: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          location_name: string
          notes?: string | null
          source_url?: string | null
          status?: string
          submitter_email?: string | null
          suggested_change: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          location_name?: string
          notes?: string | null
          source_url?: string | null
          status?: string
          submitter_email?: string | null
          suggested_change?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
