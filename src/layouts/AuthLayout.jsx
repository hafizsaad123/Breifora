import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      className="auth-layout"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Outlet />
      </div>
    </div>
  );
}
