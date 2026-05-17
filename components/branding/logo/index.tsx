import Image from "next/image";

type LogoProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  sizeClass?: string;
  priority?: boolean;
  containerClassName?: string;
  imageClassName?: string;
};

const Logo = ({
  src = "/logo_1.png",
  alt = "Ludo Win",
  width = 280,
  height = 120,
  sizeClass = "w-[160px] sm:w-[220px] md:w-[260px]",
  priority = true,
  containerClassName = "",
  imageClassName = "",
}: LogoProps) => {
  return (
    <div
      className={`mx-auto flex w-full items-center justify-center ${containerClassName}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${sizeClass} ${imageClassName}`}
      />
    </div>
  );
};

export default Logo;
