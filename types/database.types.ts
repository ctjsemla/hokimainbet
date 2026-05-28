export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GameType =
  | "crash"
  | "dice"
  | "mines"
  | "plinko"
  | "wheel"
  | "keno";

export interface Database {
  public: {
    Tables: {
      game_scores: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          game: GameType;
          score: number;
          multiplier: number;
          bet_amount: number;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          game: GameType;
          score?: number;
          multiplier?: number;
          bet_amount?: number;
          played_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          game?: GameType;
          score?: number;
          multiplier?: number;
          bet_amount?: number;
          played_at?: string;
        };
        Relationships: [];
      };
      email_subscribers: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          subscribed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          subscribed_at?: string;
        };
        Relationships: [];
      };
      affiliate_clicks: {
        Row: {
          id: string;
          clicked_at: string;
          bonus_type: string;
          locale: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          clicked_at?: string;
          bonus_type: string;
          locale: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          clicked_at?: string;
          bonus_type?: string;
          locale?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          demo_balance: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          demo_balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          demo_balance?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type GameScore = Database["public"]["Tables"]["game_scores"]["Row"];
