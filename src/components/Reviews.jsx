import { useEffect, useState } from "react";

const dummyReviews = [
  {
    id: 1,
    name: "Amaka",
    date: "2026-09-12",
    message:
      "Tife store is the best, slay with Tife guys! I bought a mesh top and skirt from her and it looks like it was designed for me. She is the best guyyyys 😍",
  },
  {
    id: 2,
    name: "Tunde",
    date: "2026-09-20",
    message:
      "Fast delivery and the quality is real. Everything came exactly like the pictures. I will definitely order again.",
  },
  {
    id: 3,
    name: "Chiamaka",
    date: "2026-10-01",
    message:
      "The customer service is on another level. They answered all my questions and even helped me pick my size. Thank you Tife store 🙌",
  },
];

const Reviews = () => {
  const [reviews, setReviews] = useState(dummyReviews);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const total = reviews.length;
  const review = reviews[current];

  const next = () => setCurrent((i) => (i + 1) % total);
  const prev = () => setCurrent((i) => (i - 1 + total) % total);

  // Auto-advance every 6 seconds (pauses on hover or while the form is open)
  useEffect(() => {
    if (paused || showForm || total < 2) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, showForm, total, current]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please enter your name and your review.");
      return;
    }
    setReviews([
      {
        id: Date.now(),
        name: name.trim(),
        date: new Date().toISOString().slice(0, 10),
        message: message.trim(),
      },
      ...reviews,
    ]);
    setCurrent(0);
    setName("");
    setMessage("");
    setError("");
    setShowForm(false);
  };

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-6 py-16">
      <style>{`
        @keyframes reviewIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <h2 className="text-3xl font-bold text-center">What our customers say</h2>

      {/* One review at a time */}
      <div
        className="relative mx-auto mt-10 max-w-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          onClick={prev}
          aria-label="Previous review"
          className="absolute -left-3 md:-left-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white text-neutral-900 shadow-md text-2xl leading-none hover:scale-110 transition"
        >
          ‹
        </button>

        <article
          key={review.id}
          className="bg-white text-neutral-900 rounded-2xl shadow-lg p-6"
          style={{ animation: "reviewIn .5s ease" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">
              {review.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold leading-tight">{review.name}</h3>
              <p className="text-xs text-neutral-500">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="mt-4 text-neutral-700 leading-relaxed">
            “{review.message}”
          </p>
        </article>

        <button
          onClick={next}
          aria-label="Next review"
          className="absolute -right-3 md:-right-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white text-neutral-900 shadow-md text-2xl leading-none hover:scale-110 transition"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="mt-5 flex justify-center gap-2">
        {reviews.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setCurrent(i)}
            aria-label={`Go to review ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-neutral-900" : "w-2 bg-neutral-400"
            }`}
          />
        ))}
      </div>

      {/* Write a review */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="font-semibold underline underline-offset-4"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 mx-auto max-w-xl bg-white text-neutral-900 rounded-2xl p-6 shadow-md grid gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border border-neutral-300 rounded-lg px-3 py-2"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your experience with Tife Store..."
            rows={4}
            className="border border-neutral-300 rounded-lg px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-neutral-900 text-white px-5 py-2 font-semibold hover:bg-neutral-700 transition"
          >
            Post review
          </button>
        </form>
      )}
    </section>
  );
};

export default Reviews;