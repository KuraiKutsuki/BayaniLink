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
      reports: {
        Row: {
          id: string
          created_at: string
          category: string
          description: string
          latitude: number
          longitude: number
          barangay: string
          image_url: string | null
          status: 'Submitted' | 'In Progress' | 'Resolved'
        }
        Insert: {
          id?: string
          created_at?: string
          category: string
          description: string
          latitude: number
          longitude: number
          barangay: string
          image_url?: string | null
          status?: 'Submitted' | 'In Progress' | 'Resolved'
        }
        Update: {
          id?: string
          created_at?: string
          category?: string
          description?: string
          latitude?: number
          longitude?: number
          barangay?: string
          image_url?: string | null
          status?: 'Submitted' | 'In Progress' | 'Resolved'
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
      report_status: 'Submitted' | 'In Progress' | 'Resolved'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
