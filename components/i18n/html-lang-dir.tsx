"use client";

import * as React from "react";

const RTL_LANGS = new Set(["ar", "fa", "ur", "he"] as const);

function normalizeLang(lng: string): string {
  return (lng || "en").split("-")[0];
}

export default function HtmlLangDir({ lng }: { lng: string }) {
  React.useEffect(() => {
    const normalized = normalizeLang(lng);
    const dir = RTL_LANGS.has(normalized as never) ? "rtl" : "ltr";

    document.documentElement.lang = normalized;
    document.documentElement.dir = dir;
  }, [lng]);

  return null;
}

