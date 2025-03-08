'use client';

import React from 'react';
import StoreProvider from '@/state/redux';
import { AuthProvider } from '@/context/AuthProvider';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Providers = ({ children }: { children: React.ReactNode }) => {
  // const [queryClient] = useState(() => new QueryClient());

  return (
    // <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
    // </QueryClientProvider>
  );
};

export default Providers;
