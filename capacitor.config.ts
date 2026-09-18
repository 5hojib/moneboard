import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.monetag.publisher',
  appName: 'Monetag Publisher',
  webDir: 'dist/www',
  android: {
    // All network requests are HTTPS (api.monetag.com); mixed content not needed.
    // Disabling also removes android:usesCleartextTraffic from the Android manifest,
    // which helps avoid Play Protect flagging the APK on install.
    allowMixedContent: false
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;