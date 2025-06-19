// app/providers.tsx or wherever you use Providers
'use client';
import { Provider } from 'react-redux';
import { store } from '@/Redux/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
