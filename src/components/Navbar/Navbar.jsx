// import Logo from "./Logo";
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
  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* <Logo size={26} /> */}
        <img src={Logo} width={120} alt="Breifora Logo" className="navbar__logo" />

        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button type="button" className="btn btn--primary btn--sm">
            Start Free
          </button>
          <button type="button" className="btn btn--outline btn--sm">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
