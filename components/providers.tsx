"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        {children}
        <ToastContainer
          position="top-right"
          theme="colored"
          closeOnClick
          pauseOnHover
          className="z-[200]"
        />
      </SessionProvider>
    </ThemeProvider>
  );
}
