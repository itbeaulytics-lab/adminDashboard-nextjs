'use client';

import { Suspense } from 'react';
import LoginContent from "@/features/auth/components/LoginContent";

export default function Login() {
  return (
    <Suspense fallback={<div>Loading login page...</div>}>
      <LoginContent />
    </Suspense>
  );
}