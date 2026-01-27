export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          two_factor_enabled: boolean
          two_factor_secret: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin'
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          user_id: string
          type: 'url' | 'email'
          content: string
          is_phishing: boolean
          score: number
          reasons: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'url' | 'email'
          content: string
          is_phishing: boolean
          score: number
          reasons: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'url' | 'email'
          content?: string
          is_phishing?: boolean
          score?: number
          reasons?: string[]
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin'
      scan_type: 'url' | 'email'
    }
  }
}
