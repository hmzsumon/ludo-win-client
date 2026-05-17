"use client";

import {
  useDeleteNotificationMutation,
  useGetMyUnreadNotificationsCountQuery,
  useGetMyUnreadNotificationsQuery,
  useUpdateNotificationMutation,
} from "@/redux/features/notifications/notificationApi";
import { Bell, Check, Trash2, X } from "lucide-react";

export default function NotificationDrawer({
  open,
  onClose,
  topOffset = 50,
}: {
  open: boolean;
  onClose: () => void;
  topOffset?: number;
}) {
  const { data, isFetching } = useGetMyUnreadNotificationsQuery(undefined, {
    skip: !open,
  });

  const { data: countData } = useGetMyUnreadNotificationsCountQuery();
  const [markRead] = useUpdateNotificationMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const notifications = data?.notifications ?? [];
  const unreadCount = countData?.dataCount ?? 0;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_35%),rgba(0,0,0,0.45)] backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: topOffset }}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 z-[61] w-full max-w-[390px] overflow-hidden border-l border-fuchsia-300/15 bg-[linear-gradient(180deg,rgba(58,6,92,0.97)_0%,rgba(38,4,68,0.98)_55%,rgba(24,3,49,0.99)_100%)] shadow-[-18px_0_50px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          top: topOffset,
          height: `calc(100dvh - ${topOffset}px)`,
        }}
        aria-hidden={!open}
      >
        {/* animated glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-8 h-40 w-40 animate-pulse rounded-full bg-fuchsia-500/12 blur-3xl" />
          <div className="absolute right-0 top-32 h-44 w-44 animate-pulse rounded-full bg-violet-400/10 blur-3xl [animation-delay:1200ms]" />
          <div className="absolute bottom-20 left-6 h-32 w-32 animate-pulse rounded-full bg-yellow-300/10 blur-3xl [animation-delay:2200ms]" />
        </div>

        {/* Header */}
        <div className="relative border-b border-white/10 bg-white/[0.03] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Bell className="h-5 w-5 text-yellow-300" />
              </div>

              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-yellow-300/80">
                  Alert Center
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">
                    Notifications
                  </h2>
                  {unreadCount ? (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400 px-2 py-0.5 text-[11px] font-black text-[#2b0943] shadow">
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-neutral-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,215,0,0.45),transparent)]" />
        </div>

        {/* Body */}
        <div className="relative h-[calc(100%-92px)] overflow-y-auto p-3 text-sm text-neutral-200">
          {isFetching ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-yellow-300" />
                <p className="text-sm font-semibold text-white/90">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-white/10">
                  <Bell className="h-6 w-6 text-yellow-300" />
                </div>
                <h3 className="text-lg font-black text-white">
                  No New Notifications
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  You currently have no new notifications.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {notifications.map((n: any, index: number) => (
                <li
                  key={n._id}
                  className="group relative overflow-hidden rounded-[20px] border border-fuchsia-300/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300/20 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_100%)]"
                  style={{
                    animation: `fadeSlideUp 380ms ease-out ${index * 60}ms both`,
                  }}
                >
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-[linear-gradient(180deg,rgba(255,215,0,0.95),rgba(168,85,247,0.95))]" />
                  <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-fuchsia-400/10 blur-2xl transition duration-500 group-hover:bg-fuchsia-300/15" />

                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-[14px] font-black leading-5 text-white">
                        {n.title}
                      </h3>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-white/70">
                      {n.message}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => markRead(n._id)}
                        className="inline-flex items-center gap-1 rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-bold text-yellow-200 transition hover:bg-yellow-400/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark as read
                      </button>

                      <button
                        onClick={() => deleteNotification(n._id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1.5 text-[11px] font-bold text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
}
