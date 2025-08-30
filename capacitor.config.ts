import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d00075faa3e84f7fb4c577d68b077362',
  appName: 'FocusBear Buddy',
  webDir: 'dist',
  server: {
    url: 'https://d00075fa-a3e8-4f7f-b4c5-77d68b077362.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;