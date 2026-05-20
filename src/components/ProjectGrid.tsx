import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { projects } from "../data/photos";
import { justifyLayout } from "../lib/justifyLayout";

// Three breakpoints: phone (stacked), tablet (2 cols), desktop (3 cols).
// Note these thresholds are checked against the *inner* container width
// (already excluding the parent section's horizontal padding), not the
// raw viewport — that's what ResizeObserver gives us.

const PHONE_MAX = 600;
const TABLET_MAX = 1100;

const colsForWidth = (width: number) => {
  if (width < PHONE_MAX) return 1; // mobile: stacked single column
  if (width < TABLET_MAX) return 2; // tablet
  return 3; // desktop
};

const getGap = (width: number) => {
  if (width < PHONE_MAX) return 24;
  if (width < TABLET_MAX) return 56;
  return 80;
};

const getTargetRowHeight = (width: number, avgRatio: number) => {
  const cols = colsForWidth(width);
  if (cols < 2) return 0; // mobile falls back to a single-column stack
  const gap = getGap(width);
  // containerWidth is already padding-stripped; subtract only gaps.
  const usable = width - (cols - 1) * gap;
  return Math.round(usable / (cols * avgRatio));
};

export const ProjectGrid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const items = useMemo(
    () =>
      projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        role: p.role,
        src: p.photos[0].src,
        width: p.photos[0].width,
        height: p.photos[0].height,
      })),
    []
  );

  // Use the actual average cover aspect ratio so layout math matches
  // the real mix of portrait + landscape covers in the data.
  const avgRatio = useMemo(() => {
    const total = items.reduce((s, i) => s + i.width / i.height, 0);
    return items.length > 0 ? total / items.length : 0.7;
  }, [items]);

  const targetHeight = getTargetRowHeight(containerWidth, avgRatio);
  const gap = getGap(containerWidth);
  const rows = useMemo(
    () =>
      targetHeight > 0
        ? justifyLayout(items, containerWidth, targetHeight, gap)
        : [],
    [items, containerWidth, targetHeight, gap]
  );

  return (
    <div ref={containerRef}>
      {targetHeight > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: `${gap}px` }}>
              {row.map(({ item, width, height }) => (
                <Link
                  key={item.slug}
                  to={`/gallery/${item.slug}`}
                  className="group block"
                  style={{ width, flexShrink: 0 }}
                  aria-label={`Open project: ${item.title}`}
                >
                  <div className="overflow-hidden bg-stone-100">
                    <img
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                      style={{ width, height }}
                      className="block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="pt-6">
                    <div className="text-sm text-stone-900">{item.title}</div>
                    <div
                      style={{ fontFamily: "var(--font-mono)" }}
                      className="mt-2 text-[10px] tracking-[0.25em] text-stone-500"
                    >
                      {item.role}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={`/gallery/${item.slug}`}
              className="group block"
              aria-label={`Open project: ${item.title}`}
            >
              <div className="overflow-hidden bg-stone-100">
                <img
                  src={item.src}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  className="block w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="pt-6">
                <div className="text-base text-stone-900">{item.title}</div>
                <div
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="mt-2 text-[10px] tracking-[0.25em] text-stone-500"
                >
                  {item.role}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
