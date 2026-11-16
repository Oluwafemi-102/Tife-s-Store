import { FaShoppingBag, FaHeadphones } from "react-icons/fa";
import { GiCookingPot, GiClothes } from "react-icons/gi";
import { FaGamepad } from "react-icons/fa6";
import { FcElectronics } from "react-icons/fc";

// "category" must match the category names used in your products
export const NAV_CATEGORIES = [
  { label: "Official Store", Icon: FaShoppingBag, category: null },
  { label: "Appliances", Icon: GiCookingPot, category: "Appliances" },
  { label: "Fashion", Icon: GiClothes, category: "Fashion" },
  { label: "Games", Icon: FaGamepad, category: "Games" },
  { label: "Gadgets", Icon: FaHeadphones, category: "Gadgets" },
  { label: "Electronics", Icon: FcElectronics, category: "Electronics" },
];

export const categoryPath = (category) =>
  category ? `/products?category=${encodeURIComponent(category)}` : "/products";