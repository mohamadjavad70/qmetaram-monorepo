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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string
          id: string
          module_type: string
          name: string
          prompt: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_type?: string
          name: string
          prompt?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_type?: string
          name?: string
          prompt?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      iot_commands: {
        Row: {
          action: string
          amount: number | null
          banking_reference: string | null
          created_at: string
          device_id: string
          id: string
          locale: string
          metadata: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          amount?: number | null
          banking_reference?: string | null
          created_at?: string
          device_id: string
          id?: string
          locale?: string
          metadata?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number | null
          banking_reference?: string | null
          created_at?: string
          device_id?: string
          id?: string
          locale?: string
          metadata?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_projects: {
        Row: {
          code_content: string | null
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          name: string
          project_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          code_content?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          name: string
          project_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          code_content?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          name?: string
          project_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_tool_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number | null
          parent_id: string | null
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_tool_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tool_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_tool_comments_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tool_comments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_favorites: {
        Row: {
          created_at: string
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_favorites_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_ratings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_usage: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_usage_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tools: {
        Row: {
          author: string | null
          average_rating: number | null
          category: string
          comments_count: number | null
          created_at: string
          description: string | null
          huggingface_url: string | null
          icon: string | null
          id: string
          is_featured: boolean | null
          is_trending: boolean | null
          likes_count: number | null
          name: string
          slug: string
          subcategory: string | null
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          average_rating?: number | null
          category: string
          comments_count?: number | null
          created_at?: string
          description?: string | null
          huggingface_url?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_trending?: boolean | null
          likes_count?: number | null
          name: string
          slug: string
          subcategory?: string | null
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          average_rating?: number | null
          category?: string
          comments_count?: number | null
          created_at?: string
          description?: string | null
          huggingface_url?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_trending?: boolean | null
          likes_count?: number | null
          name?: string
          slug?: string
          subcategory?: string | null
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          module_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          module: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          module?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          module?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_ai_models: {
        Row: {
          api_endpoint: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean | null
          last_trained_at: string | null
          model_config: Json | null
          name: string
          owner_id: string
          performance_metrics: Json | null
          status: string | null
          training_data: Json | null
          updated_at: string
          version: string | null
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          last_trained_at?: string | null
          model_config?: Json | null
          name: string
          owner_id: string
          performance_metrics?: Json | null
          status?: string | null
          training_data?: Json | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          last_trained_at?: string | null
          model_config?: Json | null
          name?: string
          owner_id?: string
          performance_metrics?: Json | null
          status?: string | null
          training_data?: Json | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          subdomain: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          subdomain?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          subdomain?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_evaluations: {
        Row: {
          architecture_score: number | null
          code_quality_score: number | null
          created_at: string
          detailed_analysis: string | null
          id: string
          improvements: Json | null
          overall_score: number
          performance_score: number | null
          project_id: string
          recommendations: Json | null
          security_score: number | null
          strengths: Json | null
          summary: string
        }
        Insert: {
          architecture_score?: number | null
          code_quality_score?: number | null
          created_at?: string
          detailed_analysis?: string | null
          id?: string
          improvements?: Json | null
          overall_score: number
          performance_score?: number | null
          project_id: string
          recommendations?: Json | null
          security_score?: number | null
          strengths?: Json | null
          summary: string
        }
        Update: {
          architecture_score?: number | null
          code_quality_score?: number | null
          created_at?: string
          detailed_analysis?: string | null
          id?: string
          improvements?: Json | null
          overall_score?: number
          performance_score?: number | null
          project_id?: string
          recommendations?: Json | null
          security_score?: number | null
          strengths?: Json | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ai_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          agent_limit: number
          created_at: string
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          storage_limit_mb: number
          subdomain: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_limit?: number
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          storage_limit_mb?: number
          subdomain?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_limit?: number
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          storage_limit_mb?: number
          subdomain?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ai_tool_comments_public: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          is_own_comment: boolean | null
          likes_count: number | null
          parent_id: string | null
          tool_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_own_comment?: never
          likes_count?: number | null
          parent_id?: string | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_own_comment?: never
          likes_count?: number | null
          parent_id?: string | null
          tool_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_tool_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tool_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_tool_comments_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tool_comments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_ratings_aggregate: {
        Row: {
          average_rating: number | null
          negative_ratings: number | null
          positive_ratings: number | null
          tool_id: string | null
          total_ratings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_ratings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_plan_limits: {
        Args: {
          p_plan: Database["public"]["Enums"]["plan_type"]
          p_user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      plan_type: "starter" | "pro" | "business"
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
    Enums: {
      plan_type: ["starter", "pro", "business"],
    },
  },
} as const
