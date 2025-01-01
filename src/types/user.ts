export interface UserProfile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  credits: number;
  updated_at?: string | null;
}