"use client";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950">
      <div className="h-8 w-8 animate-pulse rounded-full bg-navy-800" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
