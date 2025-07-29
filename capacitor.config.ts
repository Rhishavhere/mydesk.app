import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rhishav.mydesk',
  appName: 'mydesk',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F0F23',
      showSpinner: true,
      spinnerColor: '#60A5FA'
    }
  }
};

export default config;