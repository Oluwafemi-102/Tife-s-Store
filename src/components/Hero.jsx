import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreData } from "../context/StoreDataContext";

const INTERVAL = 6000; // time per slide in milliseconds

const ctaClass =
  "inline-block rounded-full bg-white text-black px-7 py-3 font-semibold hover:scale-105 transition";

const Hero = () => {
  const { slides } = useStoreData();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Keeps the position valid if the admin deletes a slide
  const safeIndex = slides.length ? index % slides.length : 0;
  const slide = slides[safeIndex];
  const bg = slide?.bg;
  const textColor = slide?.textColor;

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  // Auto-switch. Re-runs when index changes, so clicking "next" resets the timer.
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL
    );
    return () => clearInterval(id);
  }, [paused, index, slides.length]);

  // Page background (and text color) follows the current slide
  useEffect(() => {
    if (!bg) return;
    document.body.style.backgroundColor = bg;
    document.body.style.color = textColor;
  }, [bg, textColor]);

  // Smooth fade, and reset when the Hero is removed from the page
  useEffect(() => {
    document.body.style.transition = "background-color 700ms, color 700ms";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.body.style.transition = "";
    };
  }, []);

  if (!slide) return null; // no slides yet (still loading, or none added)

  const nextIndex = (safeIndex + 1) % slides.length;
  const next = slides[nextIndex];
  const isInternal = slide.link?.startsWith("/");

  return (
    <section
      className="relative w-full min-h-[560px] overflow-hidden transition-colors duration-700 border-b-2 border-white"
      style={{ color: slide.textColor }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes heroFade { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes heroText { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="mx-auto max-w-6xl grid md:grid-cols-2 items-center gap-6 px-6 py-5 min-h-[560px]">
        {/* Text side */}
        <div key={`text-${slide.id}`} style={{ animation: "heroText .6s ease" }}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
          <p className="text-lg opacity-90 mb-6 max-w-md">{slide.text}</p>

          {isInternal ? (
            <Link to={slide.link} className={ctaClass}>
              {slide.cta}
            </Link>
          ) : (
            <a href={slide.link || "#products"} className={ctaClass}>
              {slide.cta}
            </a>
          )}
        </div>

        {/* 3D model side */}
        <div className="h-[340px] md:h-[480px]">
          <model-viewer
            key={slide.model}
            src={slide.model}
            alt={slide.title}
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{
              width: "100%",
              height: "100%",
              animation: "heroFade .7s ease",
            }}
          />
        </div>
      </div>

      {/* Next model preview, bottom right (only when there is more than one slide) */}
      {slides.length > 1 && (
        <button
          onClick={() => setIndex(nextIndex)}
          aria-label={`Show ${next.title}`}
          className="absolute bottom-5 right-5 w-28 h-28 md:w-36 md:h-36 rounded-2xl border border-white/30 bg-white/10 backdrop-blur overflow-hidden hover:scale-105 transition"
        >
          <model-viewer
            key={`preview-${next.model}`}
            src={next.model}
            alt=""
            auto-rotate
            interaction-prompt="none"
            loading="lazy"
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
          />
          <span className="absolute bottom-1 left-2 text-xs font-semibold">
            Next
          </span>
        </button>
      )}
    </section>
  );
};

export default Hero;