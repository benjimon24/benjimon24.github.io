import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findProject, findProjectIndex, projects } from "../data/photos";

type Props = { slug: string };

const FADE_MS = 300;

export const ProjectModal: React.FC<Props> = ({ slug }) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const project = findProject(slug);
  const index = findProjectIndex(slug);

  // Animate in on mount — flip to visible on the next frame so the
  // initial opacity-0 paints before the transition starts.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => navigate("/gallery"), FADE_MS);
  }, [navigate]);

  const goTo = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= projects.length) return;
      navigate(`/gallery/${projects[newIndex].slug}`, { replace: true });
    },
    [navigate]
  );

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, slug, close, goTo, index]);

  if (!project) return null;

  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className={`fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Right-aligned scrolling photo column. Click on backdrop (left or
          around the column) closes. */}
      <div
        ref={scrollRef}
        onClick={close}
        className="relative h-full w-full overflow-y-auto overscroll-contain"
      >
        <div className="ml-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-32 sm:max-w-[60vw] sm:px-12 sm:py-40 lg:max-w-[55vw] lg:pr-16 lg:pl-0">
          {project.photos.map((photo, i) => (
            <figure
              key={photo.src}
              onClick={(e) => e.stopPropagation()}
              className="overflow-hidden"
            >
              <img
                src={photo.src}
                alt={`${project.title} — ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="block w-full"
              />
            </figure>
          ))}
        </div>
      </div>

      {/* Fixed top bar: title + counter + close. Always visible. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between gap-6 p-6 text-stone-100 sm:p-10 lg:p-12">
        <div className="pointer-events-auto min-w-0">
          <p
            style={{ fontFamily: "var(--font-mono)" }}
            className="text-[10px] tracking-[0.3em] text-stone-400"
          >
            {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} · {project.role}
          </p>
          <h2 className="mt-2 truncate text-xl text-stone-100 sm:text-2xl">
            {project.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={close}
          style={{ fontFamily: "var(--font-mono)" }}
          className="pointer-events-auto shrink-0 text-xs tracking-[0.3em] text-stone-300 transition-colors hover:text-white"
        >
          close ✕
        </button>
      </header>

      {/* Prev/next pinned to bottom-left, always visible */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-10 flex flex-col gap-5 p-6 text-stone-100 sm:p-10 lg:p-12">
        {prev && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={`Previous: ${prev.title}`}
            style={{ fontFamily: "var(--font-mono)" }}
            className="pointer-events-auto group block text-left transition-colors hover:text-white"
          >
            <span className="block text-[10px] tracking-[0.3em] text-stone-400 group-hover:text-stone-200">
              ← previous
            </span>
            <span className="mt-1 block max-w-56 truncate text-base text-stone-200 group-hover:text-white">
              {prev.title}
            </span>
          </button>
        )}
        {next && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={`Next: ${next.title}`}
            style={{ fontFamily: "var(--font-mono)" }}
            className="pointer-events-auto group block text-left transition-colors hover:text-white"
          >
            <span className="block text-[10px] tracking-[0.3em] text-stone-400 group-hover:text-stone-200">
              next →
            </span>
            <span className="mt-1 block max-w-56 truncate text-base text-stone-200 group-hover:text-white">
              {next.title}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
