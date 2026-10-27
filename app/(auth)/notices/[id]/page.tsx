"use client";

import { useGetMyNotificationQuery, useUpdateNotificationMutation } from "@/redux/features/notifications/notificationApi";
import { ArrowLeft, ExternalLink, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
  const { currentData: data, isLoading, isFetching, isError, error, refetch } = useGetMyNotificationQuery(params.id);
  const [markRead, readState] = useUpdateNotificationMutation();
  const attempted = useRef<string | null>(null);
  const notice = data?.data;

  useEffect(() => {
    if (notice && !notice.is_read && attempted.current !== params.id) {
      attempted.current = params.id;
      void markRead(params.id);
    }
  }, [notice, params.id, markRead]);

  // Only allow web links or local paths for the optional admin-provided action.
  const url = typeof notice?.url === "string" ? notice.url.trim() : "";
  const safeUrl = /^(https?:\/\/|\/(?!\/))/i.test(url) && !/[\\\u0000-\u0020]/.test(url) ? url : "";
  const notFound = error && "status" in error && error.status === 404;

  return (
    <main lang="en" className="mx-auto min-h-[70dvh] w-full max-w-3xl px-4 py-6 pb-28 text-white sm:py-10">
      <Link href="/notices" className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-yellow-200 hover:bg-white/5"><ArrowLeft size={18} />All notices</Link>
      {isLoading || (isFetching && !notice) ? <p role="status" className="py-12 text-center text-white/70">Loading notices...</p> : isError || !notice ? (
        <div role="alert" className="rounded-3xl border border-white/15 bg-purple-950/60 p-8 text-center">
          <h1 className="text-xl font-bold">{notFound ? "Notice not found" : "Unable to load notice"}</h1>
          <p className="mt-3 text-sm text-white/70">{notFound ? "This notice may have been removed. Browse the list to read other notices." : "Please try again."}</p>
          {!notFound && <button onClick={() => refetch()} className="mt-5 rounded-xl bg-yellow-300 px-4 py-2 font-bold text-purple-950">Try again</button>}
        </div>
      ) : (
        <article className="overflow-hidden rounded-3xl border border-yellow-300/20 bg-gradient-to-br from-purple-950 to-[#210638] shadow-xl">
          <header className="border-b border-white/10 p-6 sm:p-8">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-yellow-300/10 px-3 py-1.5 text-xs font-bold text-yellow-200"><Megaphone size={16} />LudoWin Notice</span>
            <h1 className="whitespace-pre-wrap break-words text-2xl font-bold leading-relaxed sm:text-3xl">{notice.title || "Notice"}</h1>
            {notice.createdAt && <time dateTime={notice.createdAt} className="mt-4 block text-sm text-white/60">{new Date(notice.createdAt).toLocaleString("en-BD")}</time>}
          </header>
          <div className="p-6 sm:p-8">
            <div className="whitespace-pre-wrap text-base leading-8 text-white/90 [overflow-wrap:anywhere]">{notice.message}</div>
            {safeUrl && <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-300 px-5 py-3 text-sm font-bold text-purple-950 hover:bg-yellow-200">Open related link<ExternalLink size={16} /></a>}
          </div>
        </article>
      )}
      {notice && readState.isError && <div role="alert" className="mt-4 text-sm text-yellow-100">Could not mark this notice as read. <button disabled={readState.isLoading} onClick={() => markRead(params.id)} className="underline disabled:opacity-50">Try again</button></div>}
    </main>
  );
}
