import '@/styles/globals-fixed.css';
import React from 'react';
import ThemeProvider from '@/components/ui/ThemeContext';
import UserProvider from '@/contexts/UserContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;