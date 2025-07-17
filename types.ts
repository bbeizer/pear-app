export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProfileSetup: undefined;
    Availability: undefined;
};

export interface Profile {
  id: string;
  name: string;
  bio: string;
  gender?: string;
  sexuality?: string;
  age?: number;
  age_range_min?: number;
  age_range_max?: number;
  religion?: string;
  politics?: string;
  height?: string;
  dealBreakers?: {
    gender?: string[];
    sexuality?: string[];
    age_range_min?: number;
    age_range_max?: number;
    religion?: string[];
    politics?: string[];
    height?: string[];
  };
  avatar_url?: string;
  photos?: {
    id: string;
    url: string;
    order: number;
    is_primary: boolean;
  }[];
  prompts?: { question: string; answer: string }[];
  weekly_availability?: string[];
  push_token?: string;
}

export type Match = {
    id: string;
    user1_id: string;
    user2_id: string;
  status: string;
  confirmed_mode?: 'video' | 'inperson';
  confirmed_at?: string;
  proposed_time?: string;
  proposed_by?: string;
  user1_profile?: { name: string };
  user2_profile?: { name: string };
    partnerName?: string;
};

export type Prompt = {
  question: string;
  answer: string;
};

export type AvailabilitySlot = string;

export type MatchWithProfiles = Match;