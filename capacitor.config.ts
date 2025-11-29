import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aquatracks.game',
  appName: 'Aqua Tracks',
  webDir: 'dist',
  android: {
    backgroundColor: '#14b8a6', // Teal color for splash
    allowMixedContent: true
  },
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // We have our own splash screen
      backgroundColor: '#14b8a6'
    }
  }
};

export default config;
