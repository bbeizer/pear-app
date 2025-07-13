import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
jest.mock('../../../lib/supabaseWithAuth', () => ({ getSupabaseWithAuth: jest.fn() }));
import CalendarScreen from '../Calendar';
import { getSupabaseWithAuth } from '../../../lib/supabaseWithAuth';

describe('CalendarScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading then confirmed dates', async () => {
        (getSupabaseWithAuth as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn(() => ({ data: { user: { id: 'u1' } } })) },
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        order: jest.fn(() => ({
                            data: [
                                {
                                    id: '1',
                                    confirmed_mode: 'video',
                                    confirmed_at: new Date().toISOString(),
                                    user1_id: 'u1',
                                    user2_id: 'u2',
                                    user1_profile: { name: 'A' },
                                    user2_profile: { name: 'B' }
                                }
                            ],
                            error: null
                        }))
                    }))
                }))
            }))
        });
        const { getByText } = render(<CalendarScreen />);
        await waitFor(() => getByText('Your Upcoming Dates'));
        expect(getByText('Your Upcoming Dates')).toBeTruthy();
        expect(getByText(/date with/)).toBeTruthy();
    });

    it('shows loading then empty if no user', async () => {
        (getSupabaseWithAuth as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn(() => ({ data: { user: null } })) },
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        order: jest.fn(() => ({
                            data: [],
                            error: null
                        }))
                    }))
                }))
            }))
        });
        const { getByText } = render(<CalendarScreen />);
        await waitFor(() => getByText('Your Upcoming Dates'));
        expect(getByText('Your Upcoming Dates')).toBeTruthy();
    });
});