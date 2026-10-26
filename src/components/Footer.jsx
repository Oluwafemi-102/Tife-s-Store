import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-white font-bold text-xl">Tife Store</h3>
          <p className="mt-2 text-sm">Quality products, delivered to you.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Quick links</h4>
          <ul className="grid gap-1 text-sm">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/products" className="hover:text-white">Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Need a website?</h4>
          <p className="text-sm">
            Created by <span className="text-white font-semibold">FERNANDEZ</span>.
            Get in touch to build yours.
          </p>
          <ul className="mt-2 grid gap-1 text-sm">
            <li>
              <a href="mailto:oluwafemiotunade@gmail.com" className="hover:text-white">
                oluwafemiotunade@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/2347047462961"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                WhatsApp me
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-4 text-center text-xs">
        © {new Date().getFullYear()} Tife Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;