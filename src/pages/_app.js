import '@/styles/globals-fixed.css';
import React from 'react';
import ThemeProvider from '@/components/ui/ThemeContext';
import UserProvider from '@/contexts/UserContext';
import { SettingsProvider } from '@/context/SettingsContext';
import AmbientAudio from '@/components/ui/AmbientAudio';

function MyApp({ Component, pageProps }) {
  return (
    <SettingsProvider>
      <AmbientAudio />
      <ThemeProvider>
        <UserProvider>
          <Component {...pageProps} />
        </UserProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default MyApp;