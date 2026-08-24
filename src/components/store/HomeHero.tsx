import Image from "next/image";
import Link from "next/link";

type HomeHeroProps = {
  fromTiktok: boolean;
};

export function HomeHero({ fromTiktok }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      <div className="absolute inset-0 lg:left-[36%]">
        <Image
          src="/images/home-hero.png"
          alt="Healthcare professional preparing medical supplies in a Nairobi clinic"
          fill
          priority
          sizes="(min-width: 1024px) 64vw, 100vw"
          className="object-cover object-[center_18%] lg:object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-navy/25 via-navy/70 to-navy lg:hidden"
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(90deg, var(--color-navy) 0%, rgba(22, 52, 76, 0.88) 18%, rgba(22, 52, 76, 0.42) 42%, rgba(22, 52, 76, 0.12) 68%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(22, 52, 76, 0.35) 0%, transparent 22%, transparent 72%, rgba(22, 52, 76, 0.55) 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-50 mix-blend-soft-light"
          style={{
            background:
              "radial-gradient(70% 80% at 80% 40%, rgba(14, 124, 123, 0.45), transparent 62%)",
          }}
          aria-hidden
        />
      </div>

      <div className="site-container relative grid min-h-[34rem] items-end py-10 sm:min-h-[36rem] sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:min-h-[36rem] lg:items-center lg:py-20">
        <div className="relative min-w-0 pt-24 sm:pt-28 lg:pt-0">
          {fromTiktok ? (
            <p className="text-sm font-semibold text-teal">Welcome from TikTok — order right here.</p>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              Nairobi CBD shop · Delivery across Kenya
            </p>
          )}

          <h1 className="hero-heading mt-3 text-cream">
            Medical supplies for clinics, caregivers and home care.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-cream/80 sm:text-lg sm:leading-8">
            Shop from our Mfangano Street store in Nairobi CBD, with delivery across Kenya.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-coral px-7 text-sm font-bold text-white shadow-[0_8px_24px_rgba(196,92,38,0.35)] transition hover:bg-coral/90"
            >
              Shop supplies
            </Link>
            <Link
              href="/bulk-orders"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-cream/25 bg-cream/5 px-7 text-sm font-semibold text-cream backdrop-blur-sm hover:bg-cream/10"
            >
              Clinic & bulk orders
            </Link>
          </div>
        </div>
        <div className="hidden min-h-[22rem] lg:block" aria-hidden />
      </div>

      <div
        className="pointer-events-none relative h-16 bg-gradient-to-b from-transparent to-white sm:h-20"
        aria-hidden
      />
    </section>
  );
}
