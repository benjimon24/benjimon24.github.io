import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Splash } from "../sections/Splash";
import { FadeBand } from "../sections/FadeBand";
import { Work } from "../sections/Work";
import { About } from "../sections/About";
import { ProjectModal } from "../components/ProjectModal";
import { BackToTop } from "../components/BackToTop";

export const Home: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { pathname, hash } = useLocation();

  // Make /about (and /#about) scroll to the about section that lives at
  // the bottom of this page. The route still exists for sharing/linking
  // — it just lands on the same home page and snaps to the section.
  useEffect(() => {
    const wantsAbout = pathname === "/about" || hash === "#about";
    if (!wantsAbout) return;
    const id = requestAnimationFrame(() => {
      document.getElementById("about")?.scrollIntoView({ behavior: "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  return (
    <>
      <Splash />
      <FadeBand />
      <Work />
      <About />
      {slug && <ProjectModal slug={slug} />}
      <BackToTop />
    </>
  );
};
