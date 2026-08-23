import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "h-14 w-auto", priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/logo/velora-mark.png"
      alt="Velora Medical Supplies"
      width={1280}
      height={1024}
      className={`block object-contain ${className}`}
      priority={priority}
    />
  );
}
