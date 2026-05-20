import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { projects } from "../data/photos";
import { justifyLayout } from "../lib/justifyLayout";

// Gap scales with viewport so tablets don't waste horizontal space
const getGap = (width: number) => {
  if (width < 768) return 24;
  if (width < 1280) return 40;
  return 64;
};

const getTargetRowHeight = (width: number) => {
  if (width < 640) return 0; // mobile fallback: single column
  if (width < 900) return 300; // small tablets
  if (width < 1280) return 400; // iPad Air portrait & landscape
  if (width < 1600) return 540; // small laptops
  return 680; // wide desktops
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

  const targetHeight = getTargetRowHeight(containerWidth);
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
                  <div className="pt-4">
                    <div className="text-sm text-stone-900">{item.title}</div>
                    <div
                      style={{ fontFamily: "var(--font-mono)" }}
                      className="mt-1.5 text-[10px] tracking-[0.25em] uppercase text-stone-500"
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
              <div className="pt-4">
                <div className="text-base text-stone-900">{item.title}</div>
                <div
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="mt-1.5 text-[10px] tracking-[0.25em] uppercase text-stone-500"
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
