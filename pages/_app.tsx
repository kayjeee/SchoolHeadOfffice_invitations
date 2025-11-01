import '../styles/globals.css';
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ThemeProvider } from '../context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <UserProvider user={pageProps.user}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}
