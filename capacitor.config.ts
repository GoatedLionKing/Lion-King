import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goatedlionking.lionking',
  appName: 'Lion King',
  webDir: '.output/public',
  server: {
    url: 'https://lion-king-tau.vercel.app',
    cleartext: false
  }
};

export default config;
