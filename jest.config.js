module.exports = {
    preset: 'react-native',
    setupFiles: ['<rootDir>/jest.setup.js'],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|expo|@expo|@unimodules|sentry-expo|@supabase|isows)/)'
    ],
    testMatch: [
        '**/__tests__/**/*.test.ts?(x)',
        '**/?(*.)+(spec|test).ts?(x)'
    ],
    moduleNameMapper: {
        '^lib/(.*)$': '<rootDir>/lib/$1',
    },
}; 