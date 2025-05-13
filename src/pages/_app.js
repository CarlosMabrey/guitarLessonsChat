import '@/styles/globals-fixed.css';
import { ThemeProvider } from '@/components/ui/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp; 