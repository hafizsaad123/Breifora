import { Outlet } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

export default function LandingLayout() {
  return (
    <div className="landing-layout">
      {/* <Navbar /> */}
      <header style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
        <nav>Landing Navbar (placeholder)</nav>
      </header>

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
