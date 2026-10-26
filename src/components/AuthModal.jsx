import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const inputClass = "border border-neutral-300 rounded-lg px-3 py-3 w-full";

const AuthModal = () => {
  const { authOpen, authMode, authMessage, closeAuth } = useAuth();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authOpen) return;
    setMode(authMode);
    setError("");
    setInfo("");
    const onKey = (e) => e.key === "Escape" && closeAuth();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [authOpen, authMode, closeAuth]);

  if (!authOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setBusy(true);

    if (mode === "signin") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(
          authError.message.toLowerCase().includes("confirm")
            ? "Please confirm your email first. Check your inbox for the link."
            : "Incorrect email or password."
        );
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (authError) {
        setError(authError.message);
      } else if (data.user && data.user.identities?.length === 0) {
        setError("An account with this email already exists. Please sign in.");
      } else if (!data.session) {
        setInfo(
          "Almost done! We sent a confirmation link to your email. Open it, then come back and sign in."
        );
      }
    }

    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white text-neutral-900 w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <button
            onClick={closeAuth}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-neutral-100 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {authMessage && (
          <p className="mt-2 text-sm text-neutral-600">{authMessage}</p>
        )}

        <form onSubmit={submit} className="mt-4 grid gap-3">
          {mode === "signup" && (
            <input
              className={inputClass}
              placeholder="Your name"
              value={name}
              maxLength={60}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className={inputClass}
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputClass}
            type="password"
            placeholder="Password (at least 8 characters)"
            value={password}
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}

          <button
            disabled={busy}
            className="rounded-full bg-neutral-900 text-white py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50 transition"
          >
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-neutral-600">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setInfo("");
            }}
            className="font-semibold underline underline-offset-4"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;