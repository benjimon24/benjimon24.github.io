import { projects } from "../data/photos";
import { ProjectGrid } from "../components/ProjectGrid";

export const Work: React.FC = () => (
  <section
    id="work"
    className="mx-auto max-w-7xl scroll-mt-24 px-8 py-32 lg:px-12 lg:py-36"
  >
    <div className="mb-16 flex items-end justify-between lg:mb-20">
      <h2 className="text-3xl text-stone-900 sm:text-4xl">Selected Work</h2>
      <p
        style={{ fontFamily: "var(--font-mono)" }}
        className="text-xs tracking-[0.3em] text-stone-500"
      >
        {projects.length} Projects
      </p>
    </div>
    <ProjectGrid />
  </section>
);
