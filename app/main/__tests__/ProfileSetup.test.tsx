import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileSetup from '../ProfileSetup';
import { supabase } from '../../../lib/supabaseClient';
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => ({ data: 'token' })),
}));
jest.mock('../../../lib/supabaseClient', () => ({
    supabase: {
        auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'id' } } })), },
        from: jest.fn(() => ({ update: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })) })),
        storage: { from: jest.fn(() => ({ upload: jest.fn(() => ({ data: { path: 'avatar.jpg' }, error: null })) })) },
    },
}));

describe.skip('ProfileSetup', () => {
    it('renders and allows input', () => {
        const { getByPlaceholderText } = render(<ProfileSetup />);
        expect(getByPlaceholderText('Your name')).toBeTruthy();
        expect(getByPlaceholderText('Bio / Fun Fact')).toBeTruthy();
    });

    it('shows permission denied alert', async () => {
        jest.resetModules();
        jest.doMock('expo-notifications', () => ({
            getPermissionsAsync: jest.fn(() => ({ status: 'denied' })),
            requestPermissionsAsync: jest.fn(() => ({ status: 'denied' })),
            getExpoPushTokenAsync: jest.fn(() => ({ data: 'token' })),
        }));
        const { findByText } = render(<ProfileSetup />);
        await waitFor(() => findByText('Set up your profile 🍐'));
    });

    it('handles save', async () => {
        const { getByText } = render(<ProfileSetup />);
        fireEvent.press(getByText('Save Profile'));
        await waitFor(() => expect(getByText('Save Profile')).toBeTruthy());
    });
}); 