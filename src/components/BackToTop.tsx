import { useEffect, useState } from "react";

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Appear once you're past the splash hero (roughly one viewport).
      setVisible(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      style={{ fontFamily: "var(--font-mono)" }}
      className={`fixed top-6 right-6 z-40 flex h-12 w-12 items-center justify-center bg-stone-900/85 text-stone-100 backdrop-blur-sm transition-all duration-300 ease-out hover:bg-stone-900 sm:top-8 sm:right-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden className="text-base leading-none">
        ↑
      </span>
    </button>
  );
};
