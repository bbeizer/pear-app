import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ matchId: 'mid' }),
    useRouter: () => ({ push: jest.fn() })
}));
jest.mock('../../../../lib/supabaseWithAuth', () => ({
    getSupabaseWithAuth: jest.fn(() => ({
        auth: { getUser: jest.fn(() => ({ data: { user: { id: 'u1' } } })) },
        from: jest.fn((table) => {
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(() => ({ data: { user1_id: 'u1', user2_id: 'u2' } })),
                        data: []
                    })),
                    in: jest.fn(() => ({
                        data: [
                            { id: 'u1', weekly_availability: ['a', 'b'] },
                            { id: 'u2', weekly_availability: ['b', 'c'] }
                        ]
                    }))
                }))
            };
        }),
        in: jest.fn(),
    }))
}));
jest.mock('../../../../lib/supabaseClient', () => ({
    supabase: {
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'u1' } } })), getSession: jest.fn() },
        from: jest.fn(() => ({ select: jest.fn(), update: jest.fn(), insert: jest.fn() })),
        storage: { from: jest.fn() },
    },
}));
jest.mock('../../../../utils/availability_parser', () => ({ parseSlotToISO: jest.fn((x) => x) }));
import ChooseTime from '../ChooseTime';
import { getSupabaseWithAuth } from '../../../../lib/supabaseWithAuth';

describe('ChooseTime', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading then overlap slots', async () => {
        const supabase = await getSupabaseWithAuth();
        const profilesFrom = supabase.from('profiles');
        const selectResult = profilesFrom.select();
        const { getByText, queryByText } = render(<ChooseTime />);
        expect(queryByText('Pick a time to meet')).toBeNull();
        await waitFor(() => getByText('Pick a time to meet'));
        expect(getByText('Mutual availability:')).toBeTruthy();
        expect(getByText('b')).toBeTruthy();
    });

    it('shows error if fetch fails', async () => {
        (getSupabaseWithAuth as jest.Mock).mockRejectedValue(new Error('fail'));
        const { findByText } = render(<ChooseTime />);
        expect(await findByText('Failed to load availability')).toBeTruthy();
    });
});