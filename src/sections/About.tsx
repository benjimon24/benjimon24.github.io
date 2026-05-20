import { site } from "../data/site";

// About section — lives at the bottom of the home page but is still
// linkable via /about (which scrolls here on mount) and #about (browser
// native anchor jump). The route is wired up in pages/Home.tsx.
export const About: React.FC = () => (
  <section
    id="about"
    className="mx-auto w-full max-w-6xl scroll-mt-12 px-8 py-24 lg:px-12 lg:py-32"
  >
    <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <img
          src={site.aboutPortrait}
          alt={site.name}
          className="block max-h-[65vh] w-full object-cover"
        />
      </div>
      <div className="min-w-0 space-y-6 lg:col-span-7">
        <p
          style={{ fontFamily: "var(--font-mono)" }}
          className="text-[10px] tracking-[0.4em] text-stone-500"
        >
          about
        </p>
        <h2 className="max-w-full text-3xl leading-tight text-stone-900 sm:text-4xl">
          {site.name}
          <span className="mt-1 block text-lg text-stone-500 sm:text-xl">
            {site.role}, {site.location}
          </span>
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-stone-700 sm:text-base">
          {site.bio}
        </p>

        <dl className="grid grid-cols-1 gap-6 border-t border-stone-200 pt-6 sm:grid-cols-2">
          <div>
            <dt
              style={{ fontFamily: "var(--font-mono)" }}
              className="text-[10px] tracking-[0.3em] text-stone-500"
            >
              based in
            </dt>
            <dd className="mt-1.5 text-sm text-stone-900">{site.location}</dd>
          </div>
          <div>
            <dt
              style={{ fontFamily: "var(--font-mono)" }}
              className="text-[10px] tracking-[0.3em] text-stone-500"
            >
              contact
            </dt>
            <dd className="mt-1.5 text-sm">
              <a
                href={`mailto:${site.email}`}
                className="case-normal break-all text-stone-900 underline-offset-4 hover:underline"
              >
                {site.email}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
);
