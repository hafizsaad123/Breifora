import { useState } from "react";
import Logo from "../../assets/logo/logo.png";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Benefits", href: "#benefits" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Breifora", href: "#why-breifora" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQs", href: "#faqs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <img src={Logo} width={120} alt="Breifora Logo" className="navbar__logo" />

        {/* Desktop Links */}
        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="navbar__actions">
          <button type="button" className="btn btn--primary btn--sm">
            Start Free
          </button>
          <button type="button" className="btn btn--outline btn--sm">
            Login
          </button>
        </div>

        {/* Hamburger Toggle Button (Mobile) */}
        <button
          type="button"
          className="navbar__toggle"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Mobile Drawer (Right Side) */}
      <div className={`navbar__mobile-drawer ${isOpen ? "is-open" : ""}`}>
        <div className="navbar__drawer-header">
          <img src={Logo} width={100} alt="Breifora Logo" />
          <button
            type="button"
            className="navbar__close"
            onClick={closeMenu}
            aria-label="Close Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="navbar__mobile-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="navbar__mobile-link"
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__mobile-actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={closeMenu}>
            Start Free
          </button>
          <button type="button" className="btn btn--outline btn--sm" onClick={closeMenu}>
            Login
          </button>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isOpen && <div className="navbar__overlay" onClick={closeMenu}></div>}
    </header>
  );
}