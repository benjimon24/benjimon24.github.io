import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { findProject, findProjectIndex, projects } from "../data/photos";

type Props = { slug: string };

export const ProjectModal: React.FC<Props> = ({ slug }) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const project = findProject(slug);
  const index = findProjectIndex(slug);

  const close = useCallback(() => navigate("/gallery"), [navigate]);

  const goTo = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= projects.length) return;
      navigate(`/gallery/${projects[newIndex].slug}`, { replace: true });
    },
    [navigate]
  );

  // Lock body scroll, set up keyboard handlers, reset modal scroll on slug change
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
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-sm sm:p-8 lg:p-12"
    >
      <div
        ref={scrollRef}
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full max-w-5xl overflow-y-auto overscroll-contain bg-stone-50 shadow-2xl"
      >
        <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-stone-50/90 backdrop-blur">
          <div className="flex items-center justify-between gap-6 px-8 py-6 lg:px-12">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500">
                {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} · {project.role}
              </p>
              <h2
                className="truncate text-xl text-stone-900 sm:text-2xl"
              >
                {project.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="shrink-0 text-xs tracking-[0.3em] uppercase text-stone-500 transition-colors hover:text-stone-900"
            >
              Close ✕
            </button>
          </div>
        </header>

        <div className="space-y-12 px-6 py-16 sm:px-16 sm:py-24 lg:px-24">
          {project.photos.map((photo, i) => (
            <figure key={photo.src} className="overflow-hidden bg-stone-100">
              <img
                src={photo.src}
                alt={`${project.title} — ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="block w-full"
              />
            </figure>
          ))}

          <nav className="grid grid-cols-2 gap-6 border-t border-stone-200 pt-16 text-xs tracking-[0.3em] uppercase text-stone-500">
            <div className="text-left">
              {prev && (
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  className="group block text-left transition-colors hover:text-stone-900"
                >
                  <span className="block text-[10px]">← Previous</span>
                  <span
                    className="mt-2 block text-base normal-case tracking-normal text-stone-900"
                  >
                    {prev.title}
                  </span>
                </button>
              )}
            </div>
            <div className="text-right">
              {next && (
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="group block w-full text-right transition-colors hover:text-stone-900"
                >
                  <span className="block text-[10px]">Next →</span>
                  <span
                    className="mt-2 block text-base normal-case tracking-normal text-stone-900"
                  >
                    {next.title}
                  </span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};
