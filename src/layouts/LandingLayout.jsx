import { Outlet } from "react-router-dom";
// import Footer from "../components/Footer";

// Note: Home renders its own <Navbar /> inside <Hero />, since the navbar
// sits on top of the hero's sky background. Other landing pages (About,
// Pricing, etc.) should import Navbar from "../components/Navbar/Navbar"
// directly until a shared marketing header/footer is added here.
export default function LandingLayout() {
  return (
    <div className="landing-layout">
      <main style={{ minHeight: "80vh" }}>
        <Outlet />
      </main>

      {/* <Footer /> */}
      <footer style={{ padding: "1rem", borderTop: "1px solid #eee" }}>
        Landing Footer (placeholder)
      </footer>
    </div>
  );
}
