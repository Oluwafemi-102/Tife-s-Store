const gradient =
  "linear-gradient(90deg, #f9a8d4, #e879f9, #fde68a, #e879f9, #f9a8d4)";

const sparkle = (animate, delay) =>
  animate
    ? { animation: `brandTwinkle 1.8s ease-in-out ${delay}s infinite` }
    : undefined;

const BrandLogo = ({ size = "text-5xl", animate = false }) => (
  <div className="relative inline-flex flex-col items-center select-none">
    <style>{`
      @keyframes brandShine { to { background-position: 200% center; } }
      @keyframes brandTwinkle {
        0%, 100% { opacity: .25; transform: scale(.7) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.15) rotate(25deg); }
      }
    `}</style>

    <span aria-hidden="true" className="absolute -top-2 -left-5 text-lg text-pink-300" style={sparkle(animate, 0)}>✦</span>
    <span aria-hidden="true" className="absolute -right-6 top-0 text-sm text-amber-200" style={sparkle(animate, 0.6)}>✦</span>
    <span aria-hidden="true" className="absolute -bottom-3 left-1/4 text-xs text-fuchsia-300" style={sparkle(animate, 1.1)}>✦</span>

    <span
      className={`satisfy-regular ${size} leading-tight pb-2 bg-clip-text text-transparent`}
      style={{
        backgroundImage: gradient,
        backgroundSize: "200% auto",
        animation: animate ? "brandShine 2.4s linear infinite" : undefined,
      }}
    >
      Slay With Tife
    </span>

    <span className="h-px w-4/5 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
  </div>
);

export default BrandLogo;