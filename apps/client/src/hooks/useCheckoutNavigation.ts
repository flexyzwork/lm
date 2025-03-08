'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';

export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();

  const courseId = searchParams.get('id') ?? '';
  const isSignedIn = !!user;
  const checkoutStep = parseInt(searchParams.get('step') ?? '1', 10);

  const navigateToStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3);
      const showSignUp = isSignedIn ? 'true' : 'false';

      router.push(`/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUp}`, {
        scroll: false,
      });
    },
    [courseId, isSignedIn, router]
  );

  useEffect(() => {
    if (!isSignedIn && checkoutStep > 1) {
      navigateToStep(1);
    }
  }, [isSignedIn, checkoutStep, navigateToStep]);

  return { checkoutStep, navigateToStep };
};
