import '../styles/globals.css';
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ThemeProvider } from '../context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import React from 'react';

const queryClient = new QueryClient();

function AuthTokenHandler() {
  useAuthToken();
  return null;
}

export default function App({ Component, pageProps }) {
  return (
    <UserProvider user={pageProps.user}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthTokenHandler />
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}
