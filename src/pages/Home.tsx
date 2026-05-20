import { Link, useParams } from "react-router-dom";
import { projects } from "../data/photos";
import { ProjectGrid } from "../components/ProjectGrid";
import { ProjectModal } from "../components/ProjectModal";

export const Home: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();

  const featured =
    projects.find((p) => p.slug === "part-1-pd-models-2nd-anniversary") ||
    projects[0];
  // Splash uses the panoramic 01 image specifically (gallery cover is 02).
  const cover =
    featured.photos.find((p) => p.src.endsWith("/01.jpg")) || featured.photos[0];

  return (
    <>
      {/* Hero image — dominates the viewport */}
      <Link
        to={`/gallery/${featured.slug}`}
        className="group relative block overflow-hidden"
        aria-label={`Open ${featured.title}`}
      >
        <img
          src={cover.src}
          alt={featured.title}
          className="h-[80vh] w-full object-cover transition-transform duration-1200 ease-out group-hover:scale-[1.015] lg:h-[88vh]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-stone-900/40 to-transparent" />
        <div
          style={{ fontFamily: "var(--font-mono)" }}
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-[10px] tracking-[0.3em] uppercase text-stone-100 sm:p-10 lg:p-14"
        >
          <span className="max-w-md leading-relaxed">{featured.title}</span>
          <span>{featured.role}</span>
        </div>
      </Link>

      {/* Intro section */}
      {/* <section className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-8 py-24 lg:grid-cols-12 lg:gap-24 lg:px-12 lg:py-32">
        <div className="lg:col-span-7">
          <p
            style={{ fontFamily: "var(--font-mono)" }}
            className="text-[11px] tracking-[0.35em] uppercase text-stone-500"
          >
            {site.role} · {site.location}
          </p>
          <h1 className="mt-8 text-5xl leading-[1.05] text-stone-900 sm:text-6xl lg:text-7xl">
            {site.name}
          </h1>
          <p className="mt-10 max-w-xl text-base leading-relaxed text-stone-600">
            Fashion and commercial image production across China and the U.S.
            Full-service production, cross-border shoot support, and
            post-production management.
          </p>
        </div>
        <div className="flex items-end gap-8 lg:col-span-5 lg:justify-end">
          <a
            href="#work"
            style={{ fontFamily: "var(--font-mono)" }}
            className="group inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-stone-900"
          >
            <span className="border-b border-stone-900 pb-1 transition-colors group-hover:border-stone-400">
              View Work
            </span>
            <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
          <Link
            to="/about"
            style={{ fontFamily: "var(--font-mono)" }}
            className="text-xs tracking-[0.3em] uppercase text-stone-500 transition-colors hover:text-stone-900"
          >
            About
          </Link>
        </div>
      </section> */}

      {/* Project grid */}
      <section
        id="work"
        className="mx-auto max-w-7xl scroll-mt-24 px-8 py-32 lg:px-12"
      >
        <div className="mb-24 flex items-end justify-between">
          <h2 className="text-3xl text-stone-900 sm:text-4xl">Selected Work</h2>
          <p
            style={{ fontFamily: "var(--font-mono)" }}
            className="text-xs tracking-[0.3em] uppercase text-stone-500"
          >
            {projects.length} Projects
          </p>
        </div>
        <ProjectGrid />
      </section>

      {slug && <ProjectModal slug={slug} />}
    </>
  );
};
