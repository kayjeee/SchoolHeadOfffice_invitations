import '../styles/globals.css';
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ThemeProvider } from '../context/ThemeContext'; // Import ThemeProvider

export default function App({ Component, pageProps }) {
  return (
    <UserProvider user={pageProps.user}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </UserProvider>
  );
}