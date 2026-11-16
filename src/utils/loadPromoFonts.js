let loaded = false;

export const loadPromoFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bebas+Neue&family=Pacifico&family=Playfair+Display:wght@700;800;900&display=swap";
  document.head.appendChild(link);
};