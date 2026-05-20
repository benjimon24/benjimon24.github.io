import { site } from "../data/site";

export const About: React.FC = () => {
  return (
    // Fill the viewport so the About content + footer fit in one screen.
    // 200px ≈ header (sticky) + footer total height.
    <section className="mx-auto flex min-h-[calc(100svh-200px)] w-full max-w-6xl items-center px-8 py-10 lg:px-12 lg:py-12">
      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <img
            src={site.aboutPortrait}
            alt={site.name}
            className="block max-h-[65vh] w-full object-cover"
          />
        </div>
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <p className="text-[10px] tracking-[0.4em] text-stone-500">about</p>
          <h1 className="max-w-full text-3xl leading-tight text-stone-900 sm:text-4xl">
            {site.name}
            <span className="mt-1 block text-lg text-stone-500 sm:text-xl">
              {site.role}, {site.location}
            </span>
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-stone-700 sm:text-base">
            {site.bio}
          </p>

          <dl className="grid grid-cols-1 gap-6 border-t border-stone-200 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] tracking-[0.3em] text-stone-500">
                based in
              </dt>
              <dd className="mt-1.5 text-sm text-stone-900">{site.location}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.3em] text-stone-500">
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
};
