module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|expo(nent)?|@expo|@unimodules|sentry-expo|native-base|@react-native-community|@react-native-picker|@react-native-masked-view|expo-modules-core|react-native-url-polyfill|expo-location|expo-font|expo-asset)/)',
    ],
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    testMatch: [
        '<rootDir>/lib/**/__tests__/**/*.(test|spec).(ts|js|tsx|jsx)',
        '<rootDir>/app/**/__tests__/**/*.(test|spec).(ts|js|tsx|jsx)'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
}; 