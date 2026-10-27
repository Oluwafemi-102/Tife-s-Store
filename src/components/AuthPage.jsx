import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
import AuthLoader from "./AuthLoader";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-500 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-300";

const perks = [
  "Your cart is saved to your account",
  "Review the products you love",
  "Order tracking is coming soon",
];

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requested = location.state?.from;
  const from = requested && requested !== "/auth" ? requested : "/";
  const notice = location.state?.message || "";

  const [mode, setMode] = useState(location.state?.mode || "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  

  // Already signed in? Send them back.
  useEffect(() => {
    if (user && !loading) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);
  
  useEffect(() => {
  const previous = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previous;
  };
}, []);

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please tell us your name.");
      return;
    }

    setLoading(true);
    try {
      const request =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email: email.trim(), password })
          : supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: { full_name: name.trim() },
                emailRedirectTo: window.location.origin,
              },
            });

      // The loading screen shows for at least 1.4 seconds so it feels smooth
      const [{ data, error: authError }] = await Promise.all([request, wait(1400)]);

      if (authError) {
        setLoading(false);
        setError(
          mode === "signin"
            ? authError.message.toLowerCase().includes("confirm")
              ? "Please confirm your email first. Check your inbox for the link."
              : "Incorrect email or password."
            : authError.message
        );
        return;
      }

      if (mode === "signup" && data.user && data.user.identities?.length === 0) {
        setLoading(false);
        setError("An account with this email already exists. Please sign in.");
        return;
      }

      if (data.session) {
        navigate(from, { replace: true }); // the loading screen leaves with the page
        return;
      }

      // New account that must confirm its email first
      setLoading(false);
      setSentTo(email.trim());
    } catch {
      setLoading(false);
      setError("Something went wrong. Please check your connection and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-neutral-950 text-white lg:flex">
      {loading && (
        <AuthLoader
          text={mode === "signin" ? "Signing you in..." : "Creating your account..."}
        />
      )}

      {/* Brand panel (desktop only) */}
      <aside className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-950 via-neutral-950 to-pink-950 p-12 lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-pink-600/25 blur-3xl" />

        <div className="relative max-w-md text-center">
          <BrandLogo size="text-7xl" animate />
          <p className="mt-8 text-2xl font-semibold">Slay. Every. Single. Day.</p>
          <p className="mt-2 text-neutral-400">
            Your style, your way. Sign in to pick up right where you left off.
          </p>

          <ul className="mt-10 grid gap-3 text-left text-sm text-neutral-300">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <span className="text-pink-300">✦</span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen w-full items-center justify-center px-5 py-16 lg:w-1/2">
        <Link
          to="/"
          className="absolute left-5 top-5 text-sm text-neutral-400 transition hover:text-white"
        >
          ← Back to store
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo size="text-5xl" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {sentTo ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/15 text-3xl">
                  ✉️
                </div>
                <h2 className="mt-5 text-2xl font-bold">Check your inbox</h2>
                <p className="mt-2 text-neutral-400">
                  We sent a confirmation link to{" "}
                  <span className="font-semibold text-white">{sentTo}</span>. Open it
                  to activate your account, then sign in.
                </p>
                <button
                  onClick={() => {
                    setSentTo("");
                    setMode("signin");
                    setPassword("");
                  }}
                  className="mt-6 w-full rounded-xl border border-white/15 py-3 font-semibold transition hover:bg-white/5"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">
                  {mode === "signin" ? "Welcome back" : "Join the slay"}
                </h1>
                <p className="mt-1 text-sm text-neutral-400">
                  {mode === "signin"
                    ? "Sign in to your account to continue."
                    : "Create an account to shop, save your cart and leave reviews."}
                </p>

                {/* Tabs */}
                <div className="mt-6 grid grid-cols-2 rounded-xl bg-white/5 p-1 text-sm font-semibold">
                  {[
                    ["signin", "Sign in"],
                    ["signup", "Create account"],
                  ].map(([key, label]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => switchMode(key)}
                      className={`rounded-lg py-2.5 transition ${
                        mode === key
                          ? "bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {notice && (
                  <p className="mt-5 rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-100">
                    {notice}
                  </p>
                )}

                <form onSubmit={submit} className="mt-5 grid gap-4">
                  {mode === "signup" && (
                    <div>
                      <label htmlFor="auth-name" className={labelClass}>
                        Your name
                      </label>
                      <input
                        id="auth-name"
                        className={inputClass}
                        placeholder="e.g. Amaka Obi"
                        value={name}
                        maxLength={60}
                        autoComplete="name"
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="auth-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="auth-email"
                      className={inputClass}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      autoComplete="email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="auth-password" className={labelClass}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="auth-password"
                        className={`${inputClass} pr-16`}
                        type={showPw ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={password}
                        minLength={8}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 py-3.5 font-semibold shadow-lg shadow-pink-900/40 transition hover:brightness-110 active:scale-[.99] disabled:opacity-60"
                  >
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;