"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      {children}
      <Toaster
        theme={theme as "light" | "dark"}
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: "var(--font-body)",
          },
        }}
      />
    </>
  );
}
