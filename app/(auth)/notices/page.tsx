"use client";

import { useGetMyNoticesQuery } from "@/redux/features/notifications/notificationApi";
import { ArrowLeft, ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NoticeMessage from "@/components/notice/NoticeMessage";

export default function NoticesPage() {
  const [skip, setSkip] = useState(0);
  const { currentData: data, isFetching, isError, refetch } = useGetMyNoticesQuery(skip);
  const notices = data?.notifications ?? data?.data ?? [];

  return (
    <main lang="en" className="mx-auto min-h-[70dvh] w-full max-w-3xl px-4 py-6 pb-28 text-white sm:py-10">
      <div className="mb-6 rounded-3xl border border-yellow-300/20 bg-gradient-to-br from-purple-900 to-[#210638] p-6 shadow-xl">
        <Megaphone className="mb-4 h-8 w-8 text-yellow-300" />
        <h1 className="text-2xl font-bold">Notice Board</h1>
        <p className="mt-2 text-sm leading-6 text-white/70">Announcements and important updates. Select a notice to read the full details.</p>
      </div>

      {isFetching ? <p role="status" className="py-12 text-center text-white/70">Loading notices...</p> : isError ? (
        <div role="alert" className="rounded-2xl border border-white/15 p-6 text-center">
          <p>Unable to load notices.</p>
          <button onClick={() => refetch()} className="mt-4 rounded-xl bg-yellow-300 px-4 py-2 font-bold text-purple-950">Try again</button>
        </div>
      ) : notices.length === 0 ? <p className="py-12 text-center text-white/70">No notices yet.</p> : (
        <ul className="space-y-3">
          {notices.map((notice: any) => (
            <li key={notice._id ?? notice.id}>
              <div className="block rounded-2xl border border-white/15 bg-purple-950/60 p-5 transition hover:border-yellow-300/50 hover:bg-purple-900/60">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  {!notice.is_read && <span className="rounded-full bg-yellow-300/15 px-2.5 py-1 font-bold text-yellow-200">New</span>}
                  {notice.createdAt && <time dateTime={notice.createdAt}>{new Date(notice.createdAt).toLocaleDateString("en-BD")}</time>}
                </div>
                <Link href={`/notices/${encodeURIComponent(notice._id ?? notice.id)}`} className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"><h2 className="break-words text-lg font-bold">{notice.title || "Notice"}</h2></Link>
                <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-white/70"><NoticeMessage message={notice.message || ""} /></p>
                <Link href={`/notices/${encodeURIComponent(notice._id ?? notice.id)}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-yellow-200">Read more <ArrowRight size={16} /></Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button disabled={skip === 0 || isFetching} onClick={() => setSkip((value) => Math.max(0, value - 20))} className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 disabled:opacity-30"><ArrowLeft size={16} />Previous</button>
        <span className="text-sm text-white/60">Page {Math.floor(skip / 20) + 1}</span>
        <button disabled={isFetching || !data || skip + 20 >= (data.total ?? 0)} onClick={() => setSkip((value) => value + 20)} className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 disabled:opacity-30">Next<ArrowRight size={16} /></button>
      </div>
    </main>
  );
}
