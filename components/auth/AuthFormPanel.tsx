import type { ReactNode } from "react";

interface AuthFormPanelProps {
  children: ReactNode;
}

export function AuthFormPanel({ children }: AuthFormPanelProps) {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-navy-950 px-6 py-10 lg:min-h-screen lg:px-12 lg:py-0">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
