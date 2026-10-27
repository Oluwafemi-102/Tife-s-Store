import BrandLogo from "./BrandLogo";

const AuthLoader = ({ text }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-md"
  >
    <style>{`
      @keyframes authBar {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(350%); }
      }
    `}</style>

    <div className="relative px-10 py-6">
      <div className="absolute inset-0 rounded-full bg-fuchsia-600/30 blur-3xl animate-pulse" />
      <div className="relative">
        <BrandLogo size="text-6xl" animate />
      </div>
    </div>

    <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full w-1/3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500"
        style={{ animation: "authBar 1.2s ease-in-out infinite" }}
      />
    </div>
    <p className="mt-4 text-sm tracking-wide text-neutral-300">{text}</p>
  </div>
);

export default AuthLoader;