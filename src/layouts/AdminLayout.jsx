import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";

export default function AdminLayout() {
  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, borderRight: "1px solid #eee", padding: "1rem" }}>
        {/* <Sidebar role="admin" /> */}
        Admin Sidebar (placeholder)
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
          {/* <Navbar /> */}
          Admin Navbar (placeholder)
        </header>

        <main style={{ flex: 1, padding: "1rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
