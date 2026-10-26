const Stars = ({ value = 0, size = "text-lg" }) => {
  const rounded = Math.round(value);
  return (
    <span aria-label={`${value} out of 5 stars`} className={`${size} leading-none`}>
      <span className="text-amber-500">{"★".repeat(rounded)}</span>
      <span className="text-neutral-300">{"★".repeat(5 - rounded)}</span>
    </span>
  );
};

export default Stars;