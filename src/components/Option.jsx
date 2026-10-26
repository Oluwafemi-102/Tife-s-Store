import { useNavigate } from "react-router-dom";

const Option = ({
  icon,
  label,
  styles = "",
  to,
  onClick,
  active = false,
  hasDropdown,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={active ? "page" : undefined}
      aria-haspopup={hasDropdown ? "menu" : undefined}
      className={`${styles} ${active ? "bg-white/20" : ""}`}
    >
      {icon}
      {label}
      {hasDropdown && <span aria-hidden="true" className="text-xs">▾</span>}
    </button>
  );
};

export default Option;