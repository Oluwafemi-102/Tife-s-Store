import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Option from "./Option";
import { FaRegUser, FaShoppingBag, FaHeadphones } from "react-icons/fa";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";
import { GiCookingPot, GiClothes } from "react-icons/gi";
import { FaGamepad } from "react-icons/fa6";
import { FcElectronics } from "react-icons/fc";
import { useCart } from "../context/CartContext";
import { useAdmin } from "../context/AdminContext";

// category must match the "category" field in your products exactly
const categories = [
  { label: "Official Store", icon: <FaShoppingBag className="text-2xl" />, category: null },
  { label: "Appliances", icon: <GiCookingPot className="text-2xl" />, category: "Appliances" },
  { label: "Fashion", icon: <GiClothes className="text-2xl" />, category: "Fashion" },
  { label: "Games", icon: <FaGamepad className="text-2xl" />, category: "Games" },
  { label: "Gadgets", icon: <FaHeadphones className="text-2xl" />, category: "Gadgets" },
  { label: "Electronics", icon: <FcElectronics className="text-2xl" />, category: "Electronics" },
];

const topStyles =
  "flex gap-2 items-center justify-center main-header-options p-3 rounded-3xl hover:cursor-pointer";
const navStyles =
  "flex gap-2 items-center justify-center p-3 rounded-3xl hover:cursor-pointer";
const itemClass =
  "block w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-neutral-100";

const Header = () => {
  const { totalItems, openCart } = useCart();
  const { openAdmin } = useAdmin();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState(null); // "account" | "help" | null
  const menuRef = useRef(null);

  const onProducts = pathname === "/products";
  const activeCategory = (searchParams.get("category") ?? "").toLowerCase();

  // Keep the search box in sync with the address
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null);
    };
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = query.trim();

    // Hidden door to the admin panel (must be exactly ADMIN)
    if (term === "ADMIN") {
      setQuery("");
      openAdmin();
      return;
    }

    navigate(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
  };

  const toggle = (name) => setMenu((m) => (m === name ? null : name));

  return (
    <div className="text-white w-full p-2 flex flex-col items-center justify-center absolute z-50">
      <div className="flex items-center justify-center gap-40">
        <h1 className="satisfy-regular text-3xl hover:cursor-pointer">
          <Link to="/">Slay With Tife</Link>
        </h1>

        <form onSubmit={handleSearch} role="search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search products"
            className="main-header-options text-white placeholder:text-gray-400 border border-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-lg rounded-2xl p-3"
          />
        </form>

        <div ref={menuRef} className="flex gap-15">
          {/* Account */}
          <div className="relative">
            <Option
              icon={<FaRegUser className="text-2xl" />}
              label="Account"
              hasDropdown
              styles={topStyles}
              onClick={() => toggle("account")}
            />
            {menu === "account" && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white text-neutral-900 shadow-xl p-2 z-50">
                {["Sign in", "Create account", "My orders"].map((label) => (
                  <span key={label} className={`${itemClass} text-neutral-400 cursor-not-allowed flex justify-between`}>
                    {label} <span className="text-xs">Soon</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <div className="relative">
            <Option
              icon={<IoIosHelpCircleOutline className="text-2xl" />}
              label="Help"
              hasDropdown
              styles={topStyles}
              onClick={() => toggle("help")}
            />
            {menu === "help" && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white text-neutral-900 shadow-xl p-2 z-50">
                <a
                  href="https://wa.me/2349078241752"
                  target="_blank"
                  rel="noreferrer"
                  className={itemClass}
                >
                  Chat on WhatsApp
                </a>
                <a href="mailto:your@email.com" className={itemClass}>
                  Email us
                </a>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="relative">
            <Option
              icon={<MdOutlineShoppingCart className="text-2xl" />}
              label="Cart"
              styles={topStyles}
              onClick={() => {
                setMenu(null);
                openCart();
              }}
            />
            {totalItems > 0 && (
              <span className="pointer-events-none absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-white text-xs flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category row */}
      <div className="flex items-center justify-center gap-30">
        {categories.map(({ label, icon, category }) => (
          <Option
            key={label}
            icon={icon}
            label={label}
            styles={navStyles}
            to={
              category
                ? `/products?category=${encodeURIComponent(category)}`
                : "/products"
            }
            active={
              onProducts &&
              (category
                ? activeCategory === category.toLowerCase()
                : !activeCategory && !searchParams.get("search"))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Header;