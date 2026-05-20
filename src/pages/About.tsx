import { site } from "../data/site";

export const About: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-8 py-24 lg:px-12 lg:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-5">
          <img
            src={site.aboutPortrait}
            alt={site.name}
            className="w-full object-cover"
          />
        </div>
        <div className="space-y-10 lg:col-span-7">
          <p className="text-xs tracking-[0.4em] uppercase text-stone-500">
            About
          </p>
          <h1
            className="text-4xl leading-tight text-stone-900 sm:text-5xl"
          >
            {site.name}
            <span className="block text-2xl text-stone-500 sm:text-3xl">
              {site.role}, {site.location}
            </span>
          </h1>
          <p className="max-w-prose text-lg leading-relaxed text-stone-700">
            {site.bio}
          </p>

          <dl className="grid grid-cols-1 gap-8 border-t border-stone-200 pt-12 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] tracking-[0.3em] uppercase text-stone-500">
                Based in
              </dt>
              <dd className="mt-2 text-stone-900">{site.location}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.3em] uppercase text-stone-500">
                Contact
              </dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${site.email}`}
                  className="text-stone-900 underline-offset-4 hover:underline"
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
