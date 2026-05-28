"use client";

import { Suspense, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { LiveTickerBar } from "@/components/layout/LiveTickerBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePathname } from "@/i18n/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="mesh-bg min-h-screen">
      <Header onMenuOpen={() => setMobileOpen(true)} />
      <Suspense fallback={null}>
        <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </Suspense>

      <main className="mesh-content flex min-h-screen flex-col pt-14 md:ml-[240px] md:pt-0">
        <LiveTickerBar />
        <div className="min-h-0 flex-1">
          <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen">
            {mounted ? children : null}
          </div>
        </div>
      </main>
    </div>
  );
}
