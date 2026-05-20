import { Outlet } from "react-router-dom";
import { site } from "../data/site";

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200/60 px-8 py-10 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs tracking-[0.25em] text-stone-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <a
            href={`mailto:${site.email}`}
            className="case-normal transition-colors hover:text-stone-900"
          >
            {site.email}
          </a>
        </div>
      </footer>
    </div>
  );
};
