export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProfileSetup: undefined;
    Availability: undefined;
};

export type MatchWithProfiles = {
    id: string;
    user1_id: string;
    user2_id: string;
    confirmed_mode: 'video' | 'inperson';
    confirmed_at: string;
    user1_profile: { name: string };
    user2_profile: { name: string };
    partnerName?: string;
};