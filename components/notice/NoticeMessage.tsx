import { splitNoticeLinks } from "@/utils/noticeLinks";

export default function NoticeMessage({ message }: { message: string }) {
  return <>{splitNoticeLinks(message).map((part, index) => part.href ? (
    <a key={index} href={part.href} className="relative text-yellow-200 underline decoration-yellow-200/60 underline-offset-4 hover:text-yellow-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">{part.text}</a>
  ) : <span key={index}>{part.text}</span>)}</>;
}
