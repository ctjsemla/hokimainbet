"use client";

import { AnimatePresence, m } from "framer-motion";
import { Suspense, useEffect, useRef, useState } from "react";
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
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    isFirstRender.current = false;
  }, [pathname]);

  const staticMain = (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen">{children}</div>
  );

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
        {mounted ? (
          <AnimatePresence mode="wait">
            <m.div
              key={pathname}
              initial={
                isFirstRender.current ? false : { opacity: 0 }
              }
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-[calc(100vh-3.5rem)] md:min-h-screen"
            >
              {children}
            </m.div>
          </AnimatePresence>
        ) : (
          staticMain
        )}
        </div>
      </main>
    </div>
  );
}
