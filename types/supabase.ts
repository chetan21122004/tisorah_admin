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
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          price_min: number | null
          price_max: number | null
          has_price_range: boolean | null
          display_image: string | null
          hover_image: string | null
          main_category: string | null
          primary_category: string | null
          secondary_category: string | null
          moq: number | null
          delivery: string | null
          rating: number | null
          featured: boolean | null
          customizable: boolean | null
          images: string[] | null
          created_at: string | null
          updated_at: string | null
          reviews: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          price_min?: number | null
          price_max?: number | null
          has_price_range?: boolean | null
          display_image?: string | null
          hover_image?: string | null
          main_category?: string | null
          primary_category?: string | null
          secondary_category?: string | null
          moq?: number | null
          delivery?: string | null
          rating?: number | null
          featured?: boolean | null
          customizable?: boolean | null
          images?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          reviews?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          price_min?: number | null
          price_max?: number | null
          has_price_range?: boolean | null
          display_image?: string | null
          hover_image?: string | null
          main_category?: string | null
          primary_category?: string | null
          secondary_category?: string | null
          moq?: number | null
          delivery?: string | null
          rating?: number | null
          featured?: boolean | null
          customizable?: boolean | null
          images?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          reviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_main_category_fkey"
            columns: ["main_category"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_primary_category_fkey"
            columns: ["primary_category"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_secondary_category_fkey"
            columns: ["secondary_category"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          type: 'edible' | 'non_edible' | null
          level: 'main' | 'secondary' | 'tertiary' | 'quaternary' | null
          created_at: string | null
          updated_at: string | null
          count: number | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          type?: 'edible' | 'non_edible' | null
          level?: 'main' | 'secondary' | 'tertiary' | 'quaternary' | null
          created_at?: string | null
          updated_at?: string | null
          count?: number | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          type?: 'edible' | 'non_edible' | null
          level?: 'main' | 'secondary' | 'tertiary' | 'quaternary' | null
          created_at?: string | null
          updated_at?: string | null
          count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      gift_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          count: number | null
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          count?: number | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          count?: number | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          company: string
          message: string | null
          budget: string | null
          timeline: string | null
          event_type: string | null
          customization: boolean | null
          branding: boolean | null
          packaging: boolean | null
          shortlisted_products: Json
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          company: string
          message?: string | null
          budget?: string | null
          timeline?: string | null
          event_type?: string | null
          customization?: boolean | null
          branding?: boolean | null
          packaging?: boolean | null
          shortlisted_products: Json
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          company?: string
          message?: string | null
          budget?: string | null
          timeline?: string | null
          event_type?: string | null
          customization?: boolean | null
          branding?: boolean | null
          packaging?: boolean | null
          shortlisted_products?: Json
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          name: string
          position: string
          company: string
          content: string
          rating: number
          product_bought: string
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          position: string
          company: string
          content: string
          rating: number
          product_bought: string
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          position?: string
          company?: string
          content?: string
          rating?: number
          product_bought?: string
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: number
          title: string
          slug: string
          excerpt: string
          content: string
          cover_image: string
          author: string
          author_image: string
          published_at: string | null
          category_id: number | null
          reading_time: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          title: string
          slug: string
          excerpt: string
          content: string
          cover_image: string
          author: string
          author_image: string
          published_at?: string | null
          category_id?: number | null
          reading_time: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          cover_image?: string
          author?: string
          author_image?: string
          published_at?: string | null
          category_id?: number | null
          reading_time?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          }
        ]
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

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  price_min?: number
  price_max?: number
  has_price_range?: boolean
  moq?: number
  delivery?: string
  rating?: number
  featured?: boolean
  customizable?: boolean
  images?: string[] | null
  display_image?: string | null
  hover_image?: string | null
  created_at?: string
  updated_at?: string
  main_category?: string | null
  sub_category?: string | null
  reviews?: number
  main_category_data?: {
    id: string
    name: string
    slug: string
    type: 'edible' | 'non_edible'
  } | null
  sub_category_data?: {
    id: string
    name: string
    slug: string
    description?: string | null
  } | null
} 