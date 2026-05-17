"use client";

import baseUrl from "@/config/baseUrl";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/* ──────────  Maintenance Gate  ──────────
   Admin maintenance ON করলে user panel এই screen দেখাবে।
────────────────────────────────────────── */
type MaintenanceStatus = {
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceGif: string;
};

const fallbackStatus: MaintenanceStatus = {
  maintenanceMode: false,
  maintenanceTitle: "Site Update",
  maintenanceMessage: "We are updating the site. Please come back shortly.",
  maintenanceGif: "/maintenance/update.gif",
};

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MaintenanceStatus>(fallbackStatus);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      try {
        const response = await fetch(`${baseUrl}/system/maintenance`, {
          cache: "no-store",
          credentials: "include",
        });
        const json = await response.json();

        if (!mounted) return;
        setStatus({ ...fallbackStatus, ...(json?.maintenance || {}) });
      } catch (_error) {
        /* API error হলে site block না করে normal user panel চালু থাকবে। */
        if (!mounted) return;
        setStatus(fallbackStatus);
      } finally {
        if (mounted) setChecked(true);
      }
    };

    loadStatus();
    const timer = setInterval(loadStatus, 15000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!checked || !status.maintenanceMode) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 text-slate-900">
      <section className="w-full max-w-xl text-center">
        <div className="mx-auto overflow-hidden rounded-[2rem] bg-white p-3">
          <Image
            src={status.maintenanceGif || "/maintenance/update.gif"}
            alt="Site maintenance update"
            width={640}
            height={640}
            unoptimized
            priority
            className="mx-auto h-auto w-full max-w-md object-contain"
          />
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
          {status.maintenanceTitle || "Site Update"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
          {status.maintenanceMessage ||
            "We are updating the site. Please come back shortly."}
        </p>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
          Maintenance Mode
        </div>
      </section>
    </main>
  );
}
