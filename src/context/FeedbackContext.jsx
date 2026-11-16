import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FeedbackContext = createContext(null);

const KINDS = {
  success: { icon: "✓", dot: "bg-green-500", bar: "bg-green-400" },
  error: { icon: "!", dot: "bg-red-500", bar: "bg-red-400" },
  info: { icon: "i", dot: "bg-sky-500", bar: "bg-sky-400" },
};

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const counter = useRef(0);

  const dismiss = useCallback(
    (id) => setToasts((list) => list.filter((t) => t.id !== id)),
    []
  );

  const push = useCallback(
    (type, message, duration) => {
      const id = ++counter.current;
      setToasts((list) => [...list.slice(-3), { id, type, message, duration }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message, duration = 4000) => push("success", message, duration),
      error: (message, duration = 6000) => push("error", message, duration),
      info: (message, duration = 4000) => push("info", message, duration),
    }),
    [push]
  );

  // Usage: const ok = await confirm({ title, message, confirmText, danger })
  const confirm = useCallback(
    (options) => new Promise((resolve) => setDialog({ ...options, resolve })),
    []
  );

  const answer = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  // Escape cancels the confirm window (and stops other windows from closing too)
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        dialog.resolve(false);
        setDialog(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [dialog]);

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateY(-12px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        @keyframes dialogIn { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[400] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96"
      >
        {toasts.map((t) => {
          const kind = KINDS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-neutral-900/95 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
              style={{ animation: "toastIn .3s ease" }}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${kind.dot}`}
                >
                  {kind.icon}
                </span>
                <p className="flex-1 text-sm leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="text-lg leading-none text-white/50 hover:text-white"
                >
                  ×
                </button>
              </div>
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${kind.bar}`}
                style={{ animation: `toastBar ${t.duration}ms linear forwards` }}
              />
            </div>
          );
        })}
      </div>

      {/* Confirm window */}
      {dialog && (
        <div className="fixed inset-0 z-[450] flex items-center justify-center p-4">
          <div
            onClick={() => answer(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={dialog.title}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-neutral-900 shadow-2xl"
            style={{ animation: "dialogIn .2s ease" }}
          >
            <h3 className="text-lg font-bold">{dialog.title}</h3>
            {dialog.message && (
              <p className="mt-2 text-sm text-neutral-600">{dialog.message}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                autoFocus
                onClick={() => answer(false)}
                className="flex-1 rounded-full border border-neutral-300 py-2.5 font-semibold hover:bg-neutral-100"
              >
                {dialog.cancelText ?? "Cancel"}
              </button>
              <button
                onClick={() => answer(true)}
                className={`flex-1 rounded-full py-2.5 font-semibold text-white ${
                  dialog.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-neutral-900 hover:bg-neutral-700"
                }`}
              >
                {dialog.confirmText ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return ctx;
};