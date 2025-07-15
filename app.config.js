export default () => ({
    expo: {
        name: "Pear App",
        slug: "pear-app",
        scheme: "pear",
        version: "1.0.0",
        extra: {
            EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
            EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: "c11542fa-a3d5-46f1-86a3-343e7a3414ac"
            }
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.benbeizer.pearapp',
            infoPlist: {
                NSCameraUsageDescription: "This app uses the camera to let you upload photos.",
                NSPhotoLibraryUsageDescription: "This app needs access to your photo library."
            }
        },
        android: {
            package: 'com.benbeizer.pearapp',
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff'
            }
        },
        plugins: ['expo-notifications'],
        updates: {
            url: "https://u.expo.dev/c11542fa-a3d5-46f1-86a3-343e7a3414ac"
        },
        runtimeVersion: "1.0.0"
    }
}); 