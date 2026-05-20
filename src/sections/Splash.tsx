import { projects } from "../data/photos";
import { site } from "../data/site";

export const Splash: React.FC = () => {
  const featured =
    projects.find((p) => p.slug === "part-1-pd-models-2nd-anniversary") ||
    projects[0];
  // Splash uses the panoramic 01 image specifically (gallery cover is 02).
  const cover =
    featured.photos.find((p) => p.src.endsWith("/01.jpg")) || featured.photos[0];

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      {/* Top black band — pushes the image down to viewport bottom */}
      <div className="flex-1 bg-black" />

      {/* Image at the bottom, with the intro text overlay sitting on
          top of its lower half */}
      <div className="relative">
        <img
          src={cover.src}
          alt={site.name}
          className="block h-[70vh] w-full object-cover sm:h-[72vh] lg:h-[78vh]"
        />

        {/* Intro content overlaid on the photo, anchored bottom-left.
            A soft-edged backdrop-blur layer sits behind the text — its
            radial mask makes the blur fade out smoothly so there's no
            visible rectangle. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-8 text-stone-100 sm:p-12 lg:p-16">
          <div className="pointer-events-auto relative max-w-3xl">
            <div
              aria-hidden
              className="absolute -inset-16 bg-stone-950/60 backdrop-blur-2xl sm:-inset-20 lg:-inset-24"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 70% at 30% 60%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, transparent 80%)",
                maskImage:
                  "radial-gradient(ellipse 70% 70% at 30% 60%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 45%, transparent 80%)",
              }}
            />
            <div className="relative">
              <p
                style={{ fontFamily: "var(--font-mono)" }}
                className="text-[11px] tracking-[0.35em] text-stone-300"
              >
                {site.role} · {site.location}
              </p>
              <h1 className="mt-6 text-5xl leading-[1.05] text-stone-50 sm:text-6xl lg:text-7xl">
                {site.name}
              </h1>
              <p className="mt-8 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base">
                Fashion and commercial image production across China and the
                U.S. Full-service production, cross-border shoot support, and
                post-production management.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href="#work"
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="group inline-flex items-center gap-3 text-xs tracking-[0.3em] text-stone-100"
                >
                  <span className="border-b border-stone-100 pb-1 transition-colors group-hover:border-stone-400">
                    view work
                  </span>
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-y-0.5"
                  >
                    ↓
                  </span>
                </a>
                <a
                  href="#about"
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="text-xs tracking-[0.3em] text-stone-300 transition-colors hover:text-stone-100"
                >
                  about
                </a>
                <a
                  href={`mailto:${site.email}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="case-normal text-xs tracking-[0.3em] text-stone-300 transition-colors hover:text-stone-100"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
