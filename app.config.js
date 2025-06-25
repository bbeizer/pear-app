export default () => ({
  expo: {
    name: "Pear App",
    slug: "pear-app",
    scheme: "pear",
    version: "1.0.0",
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },

  },
  ios: {
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera to let you upload photos.",
      NSPhotoLibraryUsageDescription: "This app needs access to your photo library."
    }
  }
});
