export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProfileSetup: undefined;
    Availability: undefined;
};

export interface Photo {
  id: string;
  url: string;
  order: number;
  is_primary: boolean;
}

export interface Prompt {
  id: string;
  profile_id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  height: string;
  bio?: string;
  photos?: Photo[];
  prompts?: Prompt[];
  featured_prompt_id?: string;
  religion?: string;
  politics?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  distance_preference?: number;
  dating_intentions?: string;
  relationship_type?: string;
  drinking_frequency?: string;
  drugs_frequency?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_name?: string;
  user2_name?: string;
  status: 'unscheduled' | 'proposed' | 'scheduled';
  meeting_type?: 'in-person' | 'video';
  suggested_activity?: string;
  suggested_venue?: string;
  user1_proposed_time?: string;
  user2_proposed_time?: string;
  created_at: string;
  updated_at: string;
  other_user_profile: Profile;
}

export type AvailabilitySlot = string;

// Union types for better type safety
export type MeetingType = 'in-person' | 'video';
export type MatchStatus = 'unscheduled' | 'proposed' | 'scheduled';