module.exports = {
    preset: 'jest-expo',
    // testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    // transformIgnorePatterns: [
    //     'node_modules/(?!(react-native|@react-native|@react-navigation|expo(nent)?|@expo|@unimodules|sentry-expo|native-base|@react-native-community|@react-native-picker|@react-native-masked-view)/)',
    // ],
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    testMatch: [
        '<rootDir>/lib/**/__tests__/**/*.(test|spec).(ts|js|tsx|jsx)'
    ],
}; 