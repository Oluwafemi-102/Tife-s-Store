import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreData } from "../context/StoreDataContext";
import { PROMO_FONTS, PROMO_STYLES } from "../utils/promoStyles";
import { loadPromoFonts } from "../utils/loadPromoFonts";

const pad = (n) => String(n).padStart(2, "0");

const split = (ms) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
};

const SmartLink = ({ to, className, style, children }) =>
  to.startsWith("/") ? (
    <Link to={to} className={className} style={style}>{children}</Link>
  ) : (
    <a href={to} className={className} style={style}>{children}</a>
  );

const Countdown = ({ ms, chip }) => {
  const { d, h, m, s } = split(ms);
  return (
    <div className="mt-6 flex justify-center gap-2 md:gap-3">
      {[["Days", d], ["Hrs", h], ["Min", m], ["Sec", s]].map(([label, value]) => (
        <div key={label} className="w-16 rounded-xl py-2 backdrop-blur md:w-20" style={{ background: chip }}>
          <div className="text-2xl font-bold tabular-nums md:text-3xl">{pad(value)}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
        </div>
      ))}
    </div>
  );
};

// The visual card. Also used for the live preview in the admin panel.
export const PromoCard = ({ promo, msLeft }) => {
   useEffect(() => {
    loadPromoFonts();
  }, []);
  const style = PROMO_STYLES[promo.style] ?? PROMO_STYLES.ember;
  const font = PROMO_FONTS[promo.font] ?? PROMO_FONTS.abril;
  const percent = Number(promo.discount_percent) || 0;

  // A ready-made design image replaces the text banner
  if (promo.image) {
    const { d, h, m, s } = split(msLeft ?? 0);
    return (
      <SmartLink to={promo.link || "/products"} className="relative block overflow-hidden rounded-3xl shadow-xl">
        <img src={promo.image} alt={promo.title} className="w-full object-cover" />
        {msLeft != null && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold tabular-nums text-white backdrop-blur">
            Ends in {d}d {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        )}
      </SmartLink>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-10 text-center shadow-2xl md:px-12 md:py-14"
      style={{ background: style.bg, color: style.text }}
    >
      <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
      {[["left-6 top-5", "text-2xl"], ["right-10 top-8", "text-lg"], ["left-1/4 bottom-6", "text-base"], ["right-1/4 bottom-10", "text-xl"]].map(([pos, size], i) => (
        <span key={i} aria-hidden="true" className={`absolute ${pos} ${size} opacity-70`} style={{ color: style.accent }}>✦</span>
      ))}

      <div className="relative">
        {promo.badge && (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] md:text-sm" style={{ color: style.accent }}>
            {promo.badge}
          </p>
        )}

        <h2
          className="mt-3 text-5xl leading-tight md:text-7xl"
          style={{
            fontFamily: font.family,
            fontWeight: font.weight,
            letterSpacing: font.spacing,
            textShadow: "0 4px 30px rgba(0,0,0,.25)",
          }}
        >
          {promo.title || "Your sale title"}
        </h2>

        {promo.subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-base opacity-90 md:text-lg">{promo.subtitle}</p>
        )}

        {percent > 0 && (
          <p className="mt-4 text-2xl font-bold md:text-3xl" style={{ color: style.accent }}>
            {percent}% OFF{promo.category ? ` ${promo.category}` : ""}
          </p>
        )}

        {msLeft != null && <Countdown ms={msLeft} chip={style.chip} />}

        <SmartLink
          to={promo.link || "/products"}
          className="mt-7 inline-block rounded-full px-8 py-3 font-semibold shadow-lg transition hover:scale-105"
          style={{ background: style.btn, color: style.btnText }}
        >
          {promo.cta || "Shop the sale"}
        </SmartLink>
      </div>
    </div>
  );
};

const Banner = ({ promo, onEnd }) => {
  const [ms, setMs] = useState(() => new Date(promo.ends_at) - Date.now());

  useEffect(() => {
    let id;
    const tick = () => {
      const left = new Date(promo.ends_at) - Date.now();
      setMs(left);
      if (left <= 0) {
        clearInterval(id);
        onEnd?.(); // sale is over: reload prices and hide the banner
      }
    };
    id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [promo.ends_at]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PromoCard promo={promo} msLeft={ms} />
    </section>
  );
};

const PromoBanner = () => {
  const { promotions, refresh } = useStoreData();
  const promo = promotions[0]; // the newest live sale
  return promo ? <Banner key={promo.id} promo={promo} onEnd={refresh} /> : null;
};

export default PromoBanner;