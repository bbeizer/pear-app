// Mock DOM for React Testing Library
global.document = {
    createElement: jest.fn(),
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    document: global.document,
};

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
    },
    NotificationFeedbackType: {
        Success: 'success',
    },
})); 