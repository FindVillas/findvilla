export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          payload: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          payload?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          period: unknown
          reason: string
          villa_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          period: unknown
          reason?: string
          villa_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          period?: unknown
          reason?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests: number
          id: string
          locale: string
          quote_snapshot: Json
          reference: string
          responded_at: string | null
          response_due_at: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          villa_id: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_id: string
          guests: number
          id?: string
          locale?: string
          quote_snapshot: Json
          reference: string
          responded_at?: string | null
          response_due_at: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          villa_id: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_id?: string
          guests?: number
          id?: string
          locale?: string
          quote_snapshot?: Json
          reference?: string
          responded_at?: string | null
          response_due_at?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string
          id: string
          payment_attempt_id: string
          reference: string
          request_id: string
          status: Database["public"]["Enums"]["booking_status"]
          test_mode: boolean
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string
          id?: string
          payment_attempt_id: string
          reference: string
          request_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          test_mode?: boolean
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string
          id?: string
          payment_attempt_id?: string
          reference?: string
          request_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          test_mode?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bookings_payment_attempt_id_fkey"
            columns: ["payment_attempt_id"]
            isOneToOne: true
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          content: Json
          created_at: string
          hero_image_url: string | null
          id: string
          name: Json
          published: boolean
          slug: string
          sort_order: number
          tagline: Json
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          hero_image_url?: string | null
          id?: string
          name: Json
          published?: boolean
          slug: string
          sort_order?: number
          tagline: Json
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          hero_image_url?: string | null
          id?: string
          name?: Json
          published?: boolean
          slug?: string
          sort_order?: number
          tagline?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          attempts: number
          created_at: string
          dedupe_key: string
          delivered_at: string | null
          id: string
          last_error: string | null
          locale: string
          next_attempt_at: string
          payload: Json
          recipient: string
          template: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          dedupe_key: string
          delivered_at?: string | null
          id?: string
          last_error?: string | null
          locale: string
          next_attempt_at?: string
          payload: Json
          recipient: string
          template: string
        }
        Update: {
          attempts?: number
          created_at?: string
          dedupe_key?: string
          delivered_at?: string | null
          id?: string
          last_error?: string | null
          locale?: string
          next_attempt_at?: string
          payload?: Json
          recipient?: string
          template?: string
        }
        Relationships: []
      }
      evidence_access_events: {
        Row: {
          actor_id: string
          created_at: string
          evidence_id: string
          id: string
          purpose: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          evidence_id: string
          id?: string
          purpose: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          evidence_id?: string
          id?: string
          purpose?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_access_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_access_events_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_documents: {
        Row: {
          application_id: string | null
          byte_size: number
          compliance_case_id: string | null
          created_at: string
          document_number: string | null
          expires_on: string | null
          id: string
          issued_on: string | null
          issuing_authority: string | null
          mime_type: string
          original_name: string
          purged_at: string | null
          requirement_code: string
          requirement_source: Database["public"]["Enums"]["requirement_source"]
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scan_status: string
          sha256: string
          status: Database["public"]["Enums"]["evidence_status"]
          storage_path: string | null
          supersedes_id: string | null
          uploaded_by: string
          version: number
        }
        Insert: {
          application_id?: string | null
          byte_size: number
          compliance_case_id?: string | null
          created_at?: string
          document_number?: string | null
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          issuing_authority?: string | null
          mime_type: string
          original_name: string
          purged_at?: string | null
          requirement_code: string
          requirement_source: Database["public"]["Enums"]["requirement_source"]
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_status?: string
          sha256: string
          status?: Database["public"]["Enums"]["evidence_status"]
          storage_path?: string | null
          supersedes_id?: string | null
          uploaded_by: string
          version?: number
        }
        Update: {
          application_id?: string | null
          byte_size?: number
          compliance_case_id?: string | null
          created_at?: string
          document_number?: string | null
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          issuing_authority?: string | null
          mime_type?: string
          original_name?: string
          purged_at?: string | null
          requirement_code?: string
          requirement_source?: Database["public"]["Enums"]["requirement_source"]
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_status?: string
          sha256?: string
          status?: Database["public"]["Enums"]["evidence_status"]
          storage_path?: string | null
          supersedes_id?: string | null
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "evidence_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_documents_compliance_case_id_fkey"
            columns: ["compliance_case_id"]
            isOneToOne: false
            referencedRelation: "property_compliance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_documents_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "evidence_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dedupe_key: string
          id: string
          locale: string
          payload: Json
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dedupe_key: string
          id?: string
          locale: string
          payload: Json
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string
          id?: string
          locale?: string
          payload?: Json
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          applicant_type: Database["public"]["Enums"]["applicant_type"]
          applicant_user_id: string
          created_at: string
          decision_note: string | null
          declarations: Json
          has_foreign_involvement: boolean
          id: string
          legal_address: Json
          legal_name_en: string
          legal_name_th: string | null
          nationality: string
          organization_id: string | null
          phone: string
          policy_version: string
          proposed_name: string
          registration_number: string | null
          relationship: Database["public"]["Enums"]["applicant_relationship"]
          retention_due_at: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["partner_application_status"]
          submitted_at: string | null
          tax_id: string | null
          updated_at: string
          vat_registered: boolean
        }
        Insert: {
          applicant_type: Database["public"]["Enums"]["applicant_type"]
          applicant_user_id: string
          created_at?: string
          decision_note?: string | null
          declarations?: Json
          has_foreign_involvement?: boolean
          id?: string
          legal_address?: Json
          legal_name_en: string
          legal_name_th?: string | null
          nationality?: string
          organization_id?: string | null
          phone: string
          policy_version?: string
          proposed_name: string
          registration_number?: string | null
          relationship: Database["public"]["Enums"]["applicant_relationship"]
          retention_due_at?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["partner_application_status"]
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string
          vat_registered?: boolean
        }
        Update: {
          applicant_type?: Database["public"]["Enums"]["applicant_type"]
          applicant_user_id?: string
          created_at?: string
          decision_note?: string | null
          declarations?: Json
          has_foreign_involvement?: boolean
          id?: string
          legal_address?: Json
          legal_name_en?: string
          legal_name_th?: string | null
          nationality?: string
          organization_id?: string | null
          phone?: string
          policy_version?: string
          proposed_name?: string
          registration_number?: string | null
          relationship?: Database["public"]["Enums"]["applicant_relationship"]
          retention_due_at?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["partner_application_status"]
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string
          vat_registered?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_memberships: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          permission?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_memberships_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          application: Json
          commission_bps: number
          created_at: string
          id: string
          name: string
          reviewed_at: string | null
          source_application_id: string | null
          status: Database["public"]["Enums"]["partner_status"]
        }
        Insert: {
          application?: Json
          commission_bps?: number
          created_at?: string
          id?: string
          name: string
          reviewed_at?: string | null
          source_application_id?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
        }
        Update: {
          application?: Json
          commission_bps?: number
          created_at?: string
          id?: string
          name?: string
          reviewed_at?: string | null
          source_application_id?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
        }
        Relationships: [
          {
            foreignKeyName: "partner_organizations_source_application_id_fkey"
            columns: ["source_application_id"]
            isOneToOne: true
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount_thb: number
          created_at: string
          id: string
          idempotency_key: string
          method: string
          provider: string
          provider_charge_id: string | null
          provider_source_id: string | null
          raw: Json
          request_id: string
          status: Database["public"]["Enums"]["payment_status"]
          test_mode: boolean
          updated_at: string
        }
        Insert: {
          amount_thb: number
          created_at?: string
          id?: string
          idempotency_key: string
          method: string
          provider?: string
          provider_charge_id?: string | null
          provider_source_id?: string | null
          raw?: Json
          request_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          test_mode?: boolean
          updated_at?: string
        }
        Update: {
          amount_thb?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          method?: string
          provider?: string
          provider_charge_id?: string | null
          provider_source_id?: string | null
          raw?: Json
          request_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          test_mode?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          locale: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          locale?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          locale?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      property_compliance_cases: {
        Row: {
          created_at: string
          decision_note: string | null
          declarations: Json
          exact_address: Json
          guest_capacity: number
          id: string
          legal_path: Database["public"]["Enums"]["accommodation_legal_path"]
          licensed_name: string
          partner_id: string
          policy_version: string
          reviewed_at: string | null
          reviewer_id: string | null
          room_count: number
          status: Database["public"]["Enums"]["compliance_status"]
          submitted_at: string | null
          updated_at: string
          villa_id: string
        }
        Insert: {
          created_at?: string
          decision_note?: string | null
          declarations?: Json
          exact_address: Json
          guest_capacity: number
          id?: string
          legal_path: Database["public"]["Enums"]["accommodation_legal_path"]
          licensed_name: string
          partner_id: string
          policy_version?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          room_count: number
          status?: Database["public"]["Enums"]["compliance_status"]
          submitted_at?: string | null
          updated_at?: string
          villa_id: string
        }
        Update: {
          created_at?: string
          decision_note?: string | null
          declarations?: Json
          exact_address?: Json
          guest_capacity?: number
          id?: string
          legal_path?: Database["public"]["Enums"]["accommodation_legal_path"]
          licensed_name?: string
          partner_id?: string
          policy_version?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          room_count?: number
          status?: Database["public"]["Enums"]["compliance_status"]
          submitted_at?: string | null
          updated_at?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_compliance_cases_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_compliance_cases_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_compliance_cases_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: true
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          request_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          stay: unknown
          updated_at: string
          villa_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          stay: unknown
          updated_at?: string
          villa_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          stay?: unknown
          updated_at?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      role_grants: {
        Row: {
          created_at: string
          email: string
          note: string | null
          partner_id: string | null
          permission: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
          partner_id?: string | null
          permission?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
          partner_id?: string | null
          permission?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_grants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_rates: {
        Row: {
          id: string
          minimum_nights: number
          name: Json
          nightly_thb: number
          period: unknown
          villa_id: string
        }
        Insert: {
          id?: string
          minimum_nights?: number
          name: Json
          nightly_thb: number
          period: unknown
          villa_id: string
        }
        Update: {
          id?: string
          minimum_nights?: number
          name?: Json
          nightly_thb?: number
          period?: unknown
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_rates_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      verification_events: {
        Row: {
          action: string
          actor_id: string | null
          application_id: string | null
          compliance_case_id: string | null
          created_at: string
          evidence_id: string | null
          id: string
          note: string | null
          payload: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          application_id?: string | null
          compliance_case_id?: string | null
          created_at?: string
          evidence_id?: string | null
          id?: string
          note?: string | null
          payload?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          application_id?: string | null
          compliance_case_id?: string | null
          created_at?: string
          evidence_id?: string | null
          id?: string
          note?: string | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_compliance_case_id_fkey"
            columns: ["compliance_case_id"]
            isOneToOne: false
            referencedRelation: "property_compliance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      villa_media: {
        Row: {
          alt_text: Json
          created_at: string
          external_url: string | null
          id: string
          sort_order: number
          storage_path: string | null
          villa_id: string
        }
        Insert: {
          alt_text?: Json
          created_at?: string
          external_url?: string | null
          id?: string
          sort_order?: number
          storage_path?: string | null
          villa_id: string
        }
        Update: {
          alt_text?: Json
          created_at?: string
          external_url?: string | null
          id?: string
          sort_order?: number
          storage_path?: string | null
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "villa_media_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villa_revisions: {
        Row: {
          content: Json
          created_at: string
          id: string
          review_note: string | null
          status: Database["public"]["Enums"]["listing_status"]
          submitted_by: string | null
          villa_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          review_note?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_by?: string | null
          villa_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          review_note?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          submitted_by?: string | null
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "villa_revisions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "villa_revisions_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villas: {
        Row: {
          base_rate_thb: number
          bathrooms: number
          bedrooms: number
          created_at: string
          current_revision_id: string | null
          destination_id: string
          featured: boolean
          id: string
          latitude: number
          longitude: number
          managed: boolean
          max_guests: number
          name: string
          partner_id: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
        }
        Insert: {
          base_rate_thb: number
          bathrooms: number
          bedrooms: number
          created_at?: string
          current_revision_id?: string | null
          destination_id: string
          featured?: boolean
          id?: string
          latitude: number
          longitude: number
          managed?: boolean
          max_guests: number
          name: string
          partner_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Update: {
          base_rate_thb?: number
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          current_revision_id?: string | null
          destination_id?: string
          featured?: boolean
          id?: string
          latitude?: number
          longitude?: number
          managed?: boolean
          max_guests?: number
          name?: string
          partner_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "villas_current_revision_fk"
            columns: ["current_revision_id"]
            isOneToOne: false
            referencedRelation: "villa_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "villas_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "villas_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_booking_request: {
        Args: { p_request_id: string }
        Returns: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests: number
          id: string
          locale: string
          quote_snapshot: Json
          reference: string
          responded_at: string | null
          response_due_at: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          villa_id: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_partner_application: {
        Args: { p_application_id: string; p_note: string }
        Returns: {
          applicant_type: Database["public"]["Enums"]["applicant_type"]
          applicant_user_id: string
          created_at: string
          decision_note: string | null
          declarations: Json
          has_foreign_involvement: boolean
          id: string
          legal_address: Json
          legal_name_en: string
          legal_name_th: string | null
          nationality: string
          organization_id: string | null
          phone: string
          policy_version: string
          proposed_name: string
          registration_number: string | null
          relationship: Database["public"]["Enums"]["applicant_relationship"]
          retention_due_at: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["partner_application_status"]
          submitted_at: string | null
          tax_id: string | null
          updated_at: string
          vat_registered: boolean
        }
        SetofOptions: {
          from: "*"
          to: "partner_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_property_compliance: {
        Args: { p_case_id: string; p_note: string }
        Returns: {
          created_at: string
          decision_note: string | null
          declarations: Json
          exact_address: Json
          guest_capacity: number
          id: string
          legal_path: Database["public"]["Enums"]["accommodation_legal_path"]
          licensed_name: string
          partner_id: string
          policy_version: string
          reviewed_at: string | null
          reviewer_id: string | null
          room_count: number
          status: Database["public"]["Enums"]["compliance_status"]
          submitted_at: string | null
          updated_at: string
          villa_id: string
        }
        SetofOptions: {
          from: "*"
          to: "property_compliance_cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_test_payment: {
        Args: {
          p_attempt_id: string
          p_provider_charge_id: string
          p_raw?: Json
        }
        Returns: {
          cancelled_at: string | null
          confirmed_at: string
          id: string
          payment_attempt_id: string
          reference: string
          request_id: string
          status: Database["public"]["Enums"]["booking_status"]
          test_mode: boolean
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decline_booking_request: {
        Args: { p_request_id: string }
        Returns: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests: number
          id: string
          locale: string
          quote_snapshot: Json
          reference: string
          responded_at: string | null
          response_due_at: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          villa_id: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_due_work: { Args: never; Returns: Json }
      expire_verification_evidence: { Args: never; Returns: Json }
      has_current_verified_evidence: {
        Args: { p_application_id: string; p_case_id: string; p_code: string }
        Returns: boolean
      }
      has_submittable_evidence: {
        Args: { p_application_id: string; p_case_id: string; p_code: string }
        Returns: boolean
      }
      is_partner_member: { Args: { org_id: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      submit_booking_request: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guests: number
          p_locale?: string
          p_villa_id: string
        }
        Returns: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests: number
          id: string
          locale: string
          quote_snapshot: Json
          reference: string
          responded_at: string | null
          response_due_at: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          villa_id: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_partner_application: {
        Args: { p_application_id: string }
        Returns: {
          applicant_type: Database["public"]["Enums"]["applicant_type"]
          applicant_user_id: string
          created_at: string
          decision_note: string | null
          declarations: Json
          has_foreign_involvement: boolean
          id: string
          legal_address: Json
          legal_name_en: string
          legal_name_th: string | null
          nationality: string
          organization_id: string | null
          phone: string
          policy_version: string
          proposed_name: string
          registration_number: string | null
          relationship: Database["public"]["Enums"]["applicant_relationship"]
          retention_due_at: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["partner_application_status"]
          submitted_at: string | null
          tax_id: string | null
          updated_at: string
          vat_registered: boolean
        }
        SetofOptions: {
          from: "*"
          to: "partner_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_property_compliance: {
        Args: { p_case_id: string }
        Returns: {
          created_at: string
          decision_note: string | null
          declarations: Json
          exact_address: Json
          guest_capacity: number
          id: string
          legal_path: Database["public"]["Enums"]["accommodation_legal_path"]
          licensed_name: string
          partner_id: string
          policy_version: string
          reviewed_at: string | null
          reviewer_id: string | null
          room_count: number
          status: Database["public"]["Enums"]["compliance_status"]
          submitted_at: string | null
          updated_at: string
          villa_id: string
        }
        SetofOptions: {
          from: "*"
          to: "property_compliance_cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      accommodation_legal_path: "hotel_license" | "non_hotel_notification"
      applicant_relationship: "owner_operator" | "manager_agent"
      applicant_type: "individual" | "legal_entity"
      booking_status: "confirmed" | "cancelled" | "completed"
      compliance_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "changes_requested"
        | "approved"
        | "rejected"
        | "suspended"
      evidence_status:
        | "pending"
        | "verified"
        | "rejected"
        | "expired"
        | "superseded"
        | "purged"
      listing_status:
        | "draft"
        | "submitted"
        | "changes_requested"
        | "approved"
        | "published"
        | "suspended"
      partner_application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "changes_requested"
        | "approved"
        | "rejected"
        | "withdrawn"
      partner_status: "pending" | "approved" | "declined" | "suspended"
      payment_status:
        | "created"
        | "pending"
        | "successful"
        | "failed"
        | "expired"
        | "refunded"
      request_status:
        | "submitted"
        | "approved_payment_pending"
        | "declined"
        | "expired"
        | "confirmed"
        | "cancelled"
      requirement_source: "statutory" | "findvillas_policy"
      reservation_status: "hold" | "confirmed" | "expired" | "cancelled"
      user_role: "guest" | "partner" | "staff"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      accommodation_legal_path: ["hotel_license", "non_hotel_notification"],
      applicant_relationship: ["owner_operator", "manager_agent"],
      applicant_type: ["individual", "legal_entity"],
      booking_status: ["confirmed", "cancelled", "completed"],
      compliance_status: [
        "draft",
        "submitted",
        "under_review",
        "changes_requested",
        "approved",
        "rejected",
        "suspended",
      ],
      evidence_status: [
        "pending",
        "verified",
        "rejected",
        "expired",
        "superseded",
        "purged",
      ],
      listing_status: [
        "draft",
        "submitted",
        "changes_requested",
        "approved",
        "published",
        "suspended",
      ],
      partner_application_status: [
        "draft",
        "submitted",
        "under_review",
        "changes_requested",
        "approved",
        "rejected",
        "withdrawn",
      ],
      partner_status: ["pending", "approved", "declined", "suspended"],
      payment_status: [
        "created",
        "pending",
        "successful",
        "failed",
        "expired",
        "refunded",
      ],
      request_status: [
        "submitted",
        "approved_payment_pending",
        "declined",
        "expired",
        "confirmed",
        "cancelled",
      ],
      requirement_source: ["statutory", "findvillas_policy"],
      reservation_status: ["hold", "confirmed", "expired", "cancelled"],
      user_role: ["guest", "partner", "staff"],
    },
  },
} as const
