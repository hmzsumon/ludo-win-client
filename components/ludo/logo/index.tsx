import Image from "next/image";

const Logo = () => (
  <div className="mx-auto flex w-full items-center justify-center">
    <Image
      src="/branding-logo_1.png"
      alt="Ludo Party"
      width={280}
      height={120}
      priority
      className="h-auto w-[100px] sm:w-[220px] md:w-[260px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
    />
  </div>
);

export default Logo;
