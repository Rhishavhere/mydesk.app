import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ea17fc7d44644022a94464eff0a7cde6',
  appName: 'rhishdesk-nexus',
  webDir: 'dist',
  server: {
    url: 'https://ea17fc7d-4464-4022-a944-64eff0a7cde6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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