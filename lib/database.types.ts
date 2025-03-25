export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string
          name: string
          team: string
          number: number | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          team: string
          number?: number | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          team?: string
          number?: number | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          grand_prix_id: string
          name: string
          description: string | null
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          grand_prix_id: string
          name: string
          description?: string | null
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grand_prix_id?: string
          name?: string
          description?: string | null
          points?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_grand_prix_id_fkey"
            columns: ["grand_prix_id"]
            referencedRelation: "grand_prix"
            referencedColumns: ["id"]
          },
        ]
      }
      grand_prix: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          status: string
          created_at: string
          updated_at: string
          country_code: string | null
          location: string | null
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          status?: string
          created_at?: string
          updated_at?: string
          country_code?: string | null
          location?: string | null
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
          updated_at?: string
          country_code?: string | null
          location?: string | null
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          id: string
          grand_prix_id: string
          user_id: string
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          grand_prix_id: string
          user_id: string
          score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grand_prix_id?: string
          user_id?: string
          score?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_grand_prix_id_fkey"
            columns: ["grand_prix_id"]
            referencedRelation: "grand_prix"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          event_id: string
          prediction: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          prediction: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          prediction?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          nickname: string | null
          role: string | null
          total_score: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          nickname?: string | null
          role?: string | null
          total_score?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          nickname?: string | null
          role?: string | null
          total_score?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          id: string
          event_id: string
          actual_result: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          actual_result: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          actual_result?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      run_update_grand_prix_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_grand_prix_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

