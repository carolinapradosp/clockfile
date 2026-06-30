'use client';

import { PWAContext } from '@/components/pwa/PWAContext';
import { useContext } from 'react';

export function usePWA() {
  return useContext(PWAContext);
}