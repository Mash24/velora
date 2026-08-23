import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  /** Use on dark backgrounds (e.g. footer, admin sidebar) */
  onDark?: boolean;
};

export function BrandLogo({
  className = "h-14 w-auto",
  priority = false,
  onDark = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo/velora-mark.png"
      alt="Velora Medical Supplies"
      width={1280}
      height={1024}
      className={`pointer-events-none block object-contain ${onDark ? "brightness-0 invert" : ""} ${className}`}
      priority={priority}
    />
  );
}
