export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  credits: number;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
  profile?: Profile;
}