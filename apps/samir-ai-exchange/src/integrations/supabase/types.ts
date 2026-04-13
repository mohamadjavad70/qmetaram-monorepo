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
      ai_agents: {
        Row: {
          created_at: string
          current_balance: number
          icon_emoji: string | null
          id: string
          initial_capital: number
          name: string
          pnl_percent: number
          risk_level: string
          slug: string
          specialty: string
          status: string
          strategy_prompt: string | null
          token_symbol: string | null
          total_pnl: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          icon_emoji?: string | null
          id?: string
          initial_capital?: number
          name: string
          pnl_percent?: number
          risk_level?: string
          slug: string
          specialty: string
          status?: string
          strategy_prompt?: string | null
          token_symbol?: string | null
          total_pnl?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          icon_emoji?: string | null
          id?: string
          initial_capital?: number
          name?: string
          pnl_percent?: number
          risk_level?: string
          slug?: string
          specialty?: string
          status?: string
          strategy_prompt?: string | null
          token_symbol?: string | null
          total_pnl?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_learning_vault: {
        Row: {
          agent_id: string
          confidence_after: number | null
          confidence_before: number | null
          created_at: string
          cycle_timestamp: string
          id: string
          indicators: Json | null
          lesson: string
        }
        Insert: {
          agent_id: string
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          cycle_timestamp?: string
          id?: string
          indicators?: Json | null
          lesson: string
        }
        Update: {
          agent_id?: string
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          cycle_timestamp?: string
          id?: string
          indicators?: Json | null
          lesson?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_vault_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_race_snapshots: {
        Row: {
          agent_id: string
          balance_snapshot: number
          id: string
          is_alpha: boolean | null
          pnl_snapshot: number
          rank: number | null
          snapshot_at: string
          token_price_growth: number | null
        }
        Insert: {
          agent_id: string
          balance_snapshot?: number
          id?: string
          is_alpha?: boolean | null
          pnl_snapshot?: number
          rank?: number | null
          snapshot_at?: string
          token_price_growth?: number | null
        }
        Update: {
          agent_id?: string
          balance_snapshot?: number
          id?: string
          is_alpha?: boolean | null
          pnl_snapshot?: number
          rank?: number | null
          snapshot_at?: string
          token_price_growth?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_race_snapshots_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_trade_logs: {
        Row: {
          action: string
          agent_id: string
          amount: number
          asset_symbol: string
          created_at: string
          id: string
          pnl: number | null
          price: number
          reasoning: string | null
        }
        Insert: {
          action: string
          agent_id: string
          amount?: number
          asset_symbol: string
          created_at?: string
          id?: string
          pnl?: number | null
          price?: number
          reasoning?: string | null
        }
        Update: {
          action?: string
          agent_id?: string
          amount?: number
          asset_symbol?: string
          created_at?: string
          id?: string
          pnl?: number | null
          price?: number
          reasoning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_trade_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          actor_id: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          target_email: string | null
          target_id: string | null
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_email?: string | null
          target_id?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_email?: string | null
          target_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      balance_transfers_audit: {
        Row: {
          admin_id: string
          amount: number
          created_at: string
          from_entity: string
          from_id: string
          id: string
          metadata: Json | null
          to_entity: string
          to_id: string
        }
        Insert: {
          admin_id: string
          amount: number
          created_at?: string
          from_entity: string
          from_id: string
          id?: string
          metadata?: Json | null
          to_entity: string
          to_id: string
        }
        Update: {
          admin_id?: string
          amount?: number
          created_at?: string
          from_entity?: string
          from_id?: string
          id?: string
          metadata?: Json | null
          to_entity?: string
          to_id?: string
        }
        Relationships: []
      }
      bot_tokens: {
        Row: {
          bot_id: string
          genetic_hash: string | null
          id: string
          minted_at: string | null
          reserve_usd: number
          status: string
          updated_at: string | null
          user_id: string
          value_usd: number
        }
        Insert: {
          bot_id: string
          genetic_hash?: string | null
          id?: string
          minted_at?: string | null
          reserve_usd?: number
          status?: string
          updated_at?: string | null
          user_id: string
          value_usd?: number
        }
        Update: {
          bot_id?: string
          genetic_hash?: string | null
          id?: string
          minted_at?: string | null
          reserve_usd?: number
          status?: string
          updated_at?: string | null
          user_id?: string
          value_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "bot_tokens_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          role: string
          tier: string
          user_id: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          role?: string
          tier?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string
          id: string
          is_completed: boolean
          mission_type: string
          reward_noor: number
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at: string
          id?: string
          is_completed?: boolean
          mission_type: string
          reward_noor?: number
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          is_completed?: boolean
          mission_type?: string
          reward_noor?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          daily_rate: number
          full_name: string
          hired_at: string
          id: string
          is_active: boolean
          last_credit_at: string | null
          role_title: string
          total_earned: number
          total_withdrawn: number
          updated_at: string
          user_id: string | null
          virtual_balance: number
        }
        Insert: {
          created_at?: string
          daily_rate?: number
          full_name: string
          hired_at?: string
          id?: string
          is_active?: boolean
          last_credit_at?: string | null
          role_title?: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string | null
          virtual_balance?: number
        }
        Update: {
          created_at?: string
          daily_rate?: number
          full_name?: string
          hired_at?: string
          id?: string
          is_active?: boolean
          last_credit_at?: string | null
          role_title?: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string | null
          virtual_balance?: number
        }
        Relationships: []
      }
      fees: {
        Row: {
          bot_id: string
          created_at: string | null
          distributed_at: string | null
          fee_usd: number
          id: string
          owner_user_id: string
          token_share_usd: number
        }
        Insert: {
          bot_id: string
          created_at?: string | null
          distributed_at?: string | null
          fee_usd?: number
          id?: string
          owner_user_id: string
          token_share_usd?: number
        }
        Update: {
          bot_id?: string
          created_at?: string | null
          distributed_at?: string | null
          fee_usd?: number
          id?: string
          owner_user_id?: string
          token_share_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "fees_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      international_cards: {
        Row: {
          admin_note: string | null
          approved_at: string | null
          approved_by: string | null
          card_brand: string
          card_hash: string
          card_last_four: string
          cardholder_name: string
          created_at: string
          expiry_masked: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          card_brand?: string
          card_hash: string
          card_last_four: string
          cardholder_name: string
          created_at?: string
          expiry_masked?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          card_brand?: string
          card_hash?: string
          card_last_four?: string
          cardholder_name?: string
          created_at?: string
          expiry_masked?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invite_tokens: {
        Row: {
          assigned_user_id: string | null
          created_at: string | null
          created_by: string
          email: string
          expires_at: string
          id: string
          is_revoked: boolean | null
          is_used: boolean | null
          revoked_at: string | null
          token_hash: string
          used_at: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string | null
          created_by: string
          email: string
          expires_at: string
          id?: string
          is_revoked?: boolean | null
          is_used?: boolean | null
          revoked_at?: string | null
          token_hash: string
          used_at?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string | null
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          is_used?: boolean | null
          revoked_at?: string | null
          token_hash?: string
          used_at?: string | null
        }
        Relationships: []
      }
      iranian_bank_cards: {
        Row: {
          bank_name: string
          card_hash: string
          card_number_masked: string
          cardholder_name: string
          created_at: string | null
          id: string
          is_verified: boolean | null
          national_id_hash: string
          shaba_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verified_at: string | null
        }
        Insert: {
          bank_name: string
          card_hash: string
          card_number_masked: string
          cardholder_name: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          national_id_hash: string
          shaba_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Update: {
          bank_name?: string
          card_hash?: string
          card_number_masked?: string
          cardholder_name?: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          national_id_hash?: string
          shaba_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          document_back_url: string | null
          document_front_url: string | null
          document_number_hash: string | null
          document_number_masked: string | null
          document_type: string | null
          id: string
          rejection_reason: string | null
          selfie_url: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_back_url?: string | null
          document_front_url?: string | null
          document_number_hash?: string | null
          document_number_masked?: string | null
          document_type?: string | null
          id?: string
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_back_url?: string | null
          document_front_url?: string | null
          document_number_hash?: string | null
          document_number_masked?: string | null
          document_type?: string | null
          id?: string
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      liquidity_pools: {
        Row: {
          base_asset_id: string | null
          base_balance: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_trade: number | null
          min_trade: number | null
          quote_asset_id: string | null
          quote_balance: number | null
          spread_percent: number | null
          updated_at: string | null
        }
        Insert: {
          base_asset_id?: string | null
          base_balance?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_trade?: number | null
          min_trade?: number | null
          quote_asset_id?: string | null
          quote_balance?: number | null
          spread_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          base_asset_id?: string | null
          base_balance?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_trade?: number | null
          min_trade?: number | null
          quote_asset_id?: string | null
          quote_balance?: number | null
          spread_percent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_pools_base_asset_id_fkey"
            columns: ["base_asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidity_pools_quote_asset_id_fkey"
            columns: ["quote_asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      login_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string | null
          is_suspicious: boolean | null
          metadata: Json | null
          suspicious_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          metadata?: Json | null
          suspicious_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          metadata?: Json | null
          suspicious_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      memorial_trees: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          location_description: string | null
          longitude: number | null
          memorial_hash: string
          planted_at: string | null
          sapling_type: string
          status: string
          updated_at: string
          user_id: string
          victim_city: string | null
          victim_name: string
          victim_year: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          memorial_hash: string
          planted_at?: string | null
          sapling_type: string
          status?: string
          updated_at?: string
          user_id: string
          victim_city?: string | null
          victim_name: string
          victim_year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          memorial_hash?: string
          planted_at?: string | null
          sapling_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          victim_city?: string | null
          victim_name?: string
          victim_year?: string | null
        }
        Relationships: []
      }
      noor_claims: {
        Row: {
          created_at: string
          id: string
          signup_claimed: boolean
          total_mission_noor: number
          total_referral_noor: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          signup_claimed?: boolean
          total_mission_noor?: number
          total_referral_noor?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          signup_claimed?: boolean
          total_mission_noor?: number
          total_referral_noor?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          phone_number: string | null
          request_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: unknown
          phone_number?: string | null
          request_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          phone_number?: string | null
          request_type?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          otp_hash: string
          phone_number: string
          purpose: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          otp_hash: string
          phone_number: string
          purpose: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          otp_hash?: string
          phone_number?: string
          purpose?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          fee_amount: number | null
          gateway_authority: string | null
          gateway_ref_id: string | null
          id: string
          metadata: Json | null
          method: string
          payment_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          fee_amount?: number | null
          gateway_authority?: string | null
          gateway_ref_id?: string | null
          id?: string
          metadata?: Json | null
          method: string
          payment_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          fee_amount?: number | null
          gateway_authority?: string | null
          gateway_ref_id?: string | null
          id?: string
          metadata?: Json | null
          method?: string
          payment_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          admin_note: string | null
          amount_usd: number
          approved_at: string | null
          approved_by: string | null
          card_expiry: string | null
          card_number_masked: string | null
          cardholder_name: string | null
          created_at: string
          fee_usd: number
          id: string
          net_amount_usd: number
          payout_session_id: string | null
          payout_type: string
          risk_flag: string | null
          status: string
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_network: string | null
        }
        Insert: {
          admin_note?: string | null
          amount_usd: number
          approved_at?: string | null
          approved_by?: string | null
          card_expiry?: string | null
          card_number_masked?: string | null
          cardholder_name?: string | null
          created_at?: string
          fee_usd?: number
          id?: string
          net_amount_usd?: number
          payout_session_id?: string | null
          payout_type: string
          risk_flag?: string | null
          status?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_network?: string | null
        }
        Update: {
          admin_note?: string | null
          amount_usd?: number
          approved_at?: string | null
          approved_by?: string | null
          card_expiry?: string | null
          card_number_masked?: string | null
          cardholder_name?: string | null
          created_at?: string
          fee_usd?: number
          id?: string
          net_amount_usd?: number
          payout_session_id?: string | null
          payout_type?: string
          risk_flag?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_network?: string | null
        }
        Relationships: []
      }
      platform_assets: {
        Row: {
          asset_type: string
          base_price_usd: number
          circulating_supply: number | null
          created_at: string | null
          current_price_usd: number
          fee_discount_percent: number | null
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          is_platform_token: boolean | null
          market_cap: number | null
          name: string
          price_change_24h: number | null
          symbol: string
          total_supply: number | null
          updated_at: string | null
          volume_24h: number | null
        }
        Insert: {
          asset_type: string
          base_price_usd: number
          circulating_supply?: number | null
          created_at?: string | null
          current_price_usd: number
          fee_discount_percent?: number | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_platform_token?: boolean | null
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          symbol: string
          total_supply?: number | null
          updated_at?: string | null
          volume_24h?: number | null
        }
        Update: {
          asset_type?: string
          base_price_usd?: number
          circulating_supply?: number | null
          created_at?: string | null
          current_price_usd?: number
          fee_discount_percent?: number | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_platform_token?: boolean | null
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          total_supply?: number | null
          updated_at?: string | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          asset_id: string | null
          close_price: number | null
          high: number | null
          id: string
          low: number | null
          open_price: number | null
          price_usd: number
          timestamp: string | null
          volume: number | null
        }
        Insert: {
          asset_id?: string | null
          close_price?: number | null
          high?: number | null
          id?: string
          low?: number | null
          open_price?: number | null
          price_usd: number
          timestamp?: string | null
          volume?: number | null
        }
        Update: {
          asset_id?: string | null
          close_price?: number | null
          high?: number | null
          id?: string
          low?: number | null
          open_price?: number | null
          price_usd?: number
          timestamp?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_demo_user: boolean | null
          phone: string | null
          referred_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_demo_user?: boolean | null
          phone?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_demo_user?: boolean | null
          phone?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          agents_unlocked: number | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          tier_level: string | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          agents_unlocked?: number | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          tier_level?: string | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          agents_unlocked?: number | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          tier_level?: string | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referral_commissions: {
        Row: {
          commission_amount: number
          commission_rate: number | null
          created_at: string | null
          id: string
          paid_at: string | null
          referral_id: string
          status: string | null
          trade_id: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          referral_id: string
          status?: string | null
          trade_id?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          referral_id?: string
          status?: string | null
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_commissions_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string | null
          total_commission_earned: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string | null
          total_commission_earned?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
          total_commission_earned?: number | null
        }
        Relationships: []
      }
      system_reserves: {
        Row: {
          balance: number
          id: string
          label: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          balance?: number
          id?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          balance?: number
          id?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      toman_transactions: {
        Row: {
          amount_irt: number
          amount_usd: number | null
          bank_tracking_code: string | null
          card_id: string | null
          completed_at: string | null
          created_at: string | null
          failure_reason: string | null
          fee_irt: number | null
          id: string
          ip_address: unknown
          processed_at: string | null
          psp_response: Json | null
          reference_number: string | null
          shaba_destination: string | null
          status: string | null
          tracking_code: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount_irt: number
          amount_usd?: number | null
          bank_tracking_code?: string | null
          card_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          fee_irt?: number | null
          id?: string
          ip_address?: unknown
          processed_at?: string | null
          psp_response?: Json | null
          reference_number?: string | null
          shaba_destination?: string | null
          status?: string | null
          tracking_code?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount_irt?: number
          amount_usd?: number | null
          bank_tracking_code?: string | null
          card_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          fee_irt?: number | null
          id?: string
          ip_address?: unknown
          processed_at?: string | null
          psp_response?: Json | null
          reference_number?: string | null
          shaba_destination?: string | null
          status?: string | null
          tracking_code?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "toman_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "iranian_bank_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string | null
          exchange_rate: number
          fee_amount: number | null
          fee_asset_id: string | null
          from_amount: number
          from_asset_id: string | null
          id: string
          is_demo: boolean | null
          status: string | null
          to_amount: number
          to_asset_id: string | null
          trade_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exchange_rate: number
          fee_amount?: number | null
          fee_asset_id?: string | null
          from_amount: number
          from_asset_id?: string | null
          id?: string
          is_demo?: boolean | null
          status?: string | null
          to_amount: number
          to_asset_id?: string | null
          trade_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          exchange_rate?: number
          fee_amount?: number | null
          fee_asset_id?: string | null
          from_amount?: number
          from_asset_id?: string | null
          id?: string
          is_demo?: boolean | null
          status?: string | null
          to_amount?: number
          to_asset_id?: string | null
          trade_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_fee_asset_id_fkey"
            columns: ["fee_asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_from_asset_id_fkey"
            columns: ["from_asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_to_asset_id_fkey"
            columns: ["to_asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_intelligence: {
        Row: {
          agent_name: string
          asset_symbol: string
          confidence: number
          created_at: string
          expires_at: string | null
          id: string
          indicators: Json
          price_at_signal: number | null
          reasoning: string | null
          risk_level: string
          signal_type: string
          status: string
          stop_loss: number | null
          target_price: number | null
          user_id: string | null
        }
        Insert: {
          agent_name: string
          asset_symbol: string
          confidence?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          indicators?: Json
          price_at_signal?: number | null
          reasoning?: string | null
          risk_level?: string
          signal_type: string
          status?: string
          stop_loss?: number | null
          target_price?: number | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          asset_symbol?: string
          confidence?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          indicators?: Json
          price_at_signal?: number | null
          reasoning?: string | null
          risk_level?: string
          signal_type?: string
          status?: string
          stop_loss?: number | null
          target_price?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_investment_ledger: {
        Row: {
          agent_id: string
          amount_usd: number
          current_value: number
          entry_price: number
          id: string
          invested_at: string
          pnl: number
          status: string
          updated_at: string
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          agent_id: string
          amount_usd?: number
          current_value?: number
          entry_price?: number
          id?: string
          invested_at?: string
          pnl?: number
          status?: string
          updated_at?: string
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          agent_id?: string
          amount_usd?: number
          current_value?: number
          entry_price?: number
          id?: string
          invested_at?: string
          pnl?: number
          status?: string
          updated_at?: string
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_investment_ledger_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          mission_name: string | null
          reward_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          mission_name?: string | null
          reward_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          mission_name?: string | null
          reward_amount?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          asset_id: string | null
          balance: number | null
          created_at: string | null
          id: string
          is_demo: boolean | null
          locked_balance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          balance?: number | null
          created_at?: string | null
          id?: string
          is_demo?: boolean | null
          locked_balance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_id?: string | null
          balance?: number | null
          created_at?: string | null
          id?: string
          is_demo?: boolean | null
          locked_balance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "platform_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      web3_wallets: {
        Row: {
          chain_id: number
          connected_at: string
          id: string
          is_primary: boolean
          user_id: string
          wallet_address: string
        }
        Insert: {
          chain_id?: number
          connected_at?: string
          id?: string
          is_primary?: boolean
          user_id: string
          wallet_address: string
        }
        Update: {
          chain_id?: number
          connected_at?: string
          id?: string
          is_primary?: boolean
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      execute_safe_transfer: {
        Args: {
          p_admin_id?: string
          p_agent_id: string
          p_amount: number
          p_direction: string
        }
        Returns: Json
      }
      get_agents_unlocked: { Args: { invite_count: number }; Returns: number }
      get_referral_tier: { Args: { invite_count: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
