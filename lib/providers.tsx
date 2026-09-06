"use client";

import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { usePathname, useRouter } from "next/navigation";

import { Toaster } from "@/components/ui/sonner";
import { fetchMe } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/hooks/redux";
import { makeStore } from "@/lib/store/store";

const PROTECTED = ["/ats", "/applications", "/profile"];

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    const onExpired = () => {
      if (PROTECTED.some((p) => pathname.startsWith(p))) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    };
    window.addEventListener("ats:session-expired", onExpired);
    return () => window.removeEventListener("ats:session-expired", onExpired);
  }, [router, pathname]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </Provider>
  );
}
