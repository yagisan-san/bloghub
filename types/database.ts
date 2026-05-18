export type ContentType =
  | 'hatena'
  | 'note'
  | 'notion'
  | 'pdf'
  | 'spreadsheet'
  | 'booth'
  | 'youtube'
  | 'other'

export type ViewMode = 'grid' | 'category' | 'order' | 'tree'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Hub {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  default_view: string
  theme: Record<string, string> | null
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  hub_id: string
  title: string
  url: string
  content_type: ContentType
  category: string | null
  tags: string[] | null
  description: string | null
  thumbnail_url: string | null
  published_at: string | null
  display_order: number
  is_visible: boolean
  parent_id: string | null
  external_id: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          cover_url: string | null
          social_links: Record<string, string> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          social_links?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          social_links?: Record<string, string> | null
          updated_at?: string
        }
        Relationships: []
      }
      hubs: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_public: boolean
          default_view: string
          card_order: string[] | null
          type_labels: Record<string, string> | null
          theme: Record<string, string> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          is_public?: boolean
          default_view?: string
          card_order?: string[] | null
          type_labels?: Record<string, string> | null
          theme?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          is_public?: boolean
          default_view?: string
          card_order?: string[] | null
          type_labels?: Record<string, string> | null
          theme?: Record<string, string> | null
          updated_at?: string
        }
        Relationships: []
      }
      contents: {
        Row: {
          id: string
          hub_id: string
          title: string
          url: string
          content_type: string
          category: string | null
          tags: string[] | null
          description: string | null
          thumbnail_url: string | null
          published_at: string | null
          display_order: number
          is_visible: boolean
          parent_id: string | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          title: string
          url: string
          content_type?: string
          category?: string | null
          tags?: string[] | null
          description?: string | null
          thumbnail_url?: string | null
          published_at?: string | null
          display_order?: number
          is_visible?: boolean
          parent_id?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          url?: string
          content_type?: string
          category?: string | null
          tags?: string[] | null
          description?: string | null
          thumbnail_url?: string | null
          published_at?: string | null
          display_order?: number
          is_visible?: boolean
          parent_id?: string | null
          external_id?: string | null
          updated_at?: string
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
