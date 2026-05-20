import { NavLink, Link } from "react-router-dom";
import { site } from "../data/site";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-mono text-xs tracking-[0.3em] transition-colors ${
    isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
  }`;

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-stone-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-10 lg:px-12">
        <Link
          to="/"
          className="text-xl tracking-wide text-stone-900"
        >
          {site.name}
        </Link>
        <nav className="flex gap-10">
          <a
            href="/#work"
            className="font-mono text-xs tracking-[0.3em] text-stone-500 transition-colors hover:text-stone-900"
          >
            Work
          </a>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-xs tracking-[0.3em] text-stone-500 transition-colors hover:text-stone-900"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};
