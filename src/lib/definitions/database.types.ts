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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      gurus: {
        Row: {
          avatar_url: string | null
          bio: string | null
          correct_prediction_count: number | null
          created_at: string
          created_by: string | null
          credibility_score: number | null
          id: string
          name: string
          slug: string
          total_predictions: number | null
          twitter_handle: string | null
          website: string | null
          youtube_channel: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          correct_prediction_count?: number | null
          created_at?: string
          created_by?: string | null
          credibility_score?: number | null
          id?: string
          name: string
          slug: string
          total_predictions?: number | null
          twitter_handle?: string | null
          website?: string | null
          youtube_channel?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          correct_prediction_count?: number | null
          created_at?: string
          created_by?: string | null
          credibility_score?: number | null
          id?: string
          name?: string
          slug?: string
          total_predictions?: number | null
          twitter_handle?: string | null
          website?: string | null
          youtube_channel?: string | null
        }
        Relationships: []
      }
      prediction_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          prediction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          prediction_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          prediction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "prediction_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_comments_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_quality_ratings: {
        Row: {
          created_at: string
          id: string
          is_clear: boolean | null
          is_verifiable: boolean | null
          notes: string | null
          prediction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_clear?: boolean | null
          is_verifiable?: boolean | null
          notes?: string | null
          prediction_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_clear?: boolean | null
          is_verifiable?: boolean | null
          notes?: string | null
          prediction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_quality_ratings_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_sources: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          manual_archive_url: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          prediction_id: string
          status: Database["public"]["Enums"]["source_status"]
          type: Database["public"]["Enums"]["source_type"]
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          manual_archive_url?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          prediction_id: string
          status?: Database["public"]["Enums"]["source_status"]
          type?: Database["public"]["Enums"]["source_type"]
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          manual_archive_url?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          prediction_id?: string
          status?: Database["public"]["Enums"]["source_status"]
          type?: Database["public"]["Enums"]["source_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_sources_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_votes: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          prediction_id: string
          user_id: string
          vote_outcome: boolean
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          prediction_id: string
          user_id?: string
          vote_outcome: boolean
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          prediction_id?: string
          user_id?: string
          vote_outcome?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prediction_votes_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          category_id: number | null
          community_vote_false_count: number | null
          community_vote_true_count: number | null
          confidence_level: number | null
          created_at: string
          created_by: string | null
          description: string | null
          guru_id: string
          id: string
          prediction_date: string
          quality_score: number | null
          resolution_mechanism: string | null
          resolution_window_end: string | null
          resolution_window_start: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["prediction_status"] | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category_id?: number | null
          community_vote_false_count?: number | null
          community_vote_true_count?: number | null
          confidence_level?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          guru_id: string
          id?: string
          prediction_date: string
          quality_score?: number | null
          resolution_mechanism?: string | null
          resolution_window_end?: string | null
          resolution_window_start?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["prediction_status"] | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category_id?: number | null
          community_vote_false_count?: number | null
          community_vote_true_count?: number | null
          confidence_level?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          guru_id?: string
          id?: string
          prediction_date?: string
          quality_score?: number | null
          resolution_mechanism?: string | null
          resolution_window_end?: string | null
          resolution_window_start?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["prediction_status"] | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "gurus"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
    }
    Enums: {
      app_permission: "gurus.delete" | "predictions.delete" | "users.manage"
      app_role: "admin" | "moderator" | "user"
      media_type: "text" | "video" | "audio" | "social"
      prediction_status:
        | "pending"
        | "correct"
        | "incorrect"
        | "void"
        | "in_evaluation"
        | "vague"
      source_status: "live" | "dead" | "archived"
      source_type: "primary" | "secondary"
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
      app_permission: ["gurus.delete", "predictions.delete", "users.manage"],
      app_role: ["admin", "moderator", "user"],
      media_type: ["text", "video", "audio", "social"],
      prediction_status: [
        "pending",
        "correct",
        "incorrect",
        "void",
        "in_evaluation",
        "vague",
      ],
      source_status: ["live", "dead", "archived"],
      source_type: ["primary", "secondary"],
    },
  },
} as const

