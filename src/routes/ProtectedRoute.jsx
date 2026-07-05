import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Guards nested routes behind authentication.
 * Optionally restrict access to specific roles via `allowedRoles`.
 *
 * Usage:
 *  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *    <Route path="/admin" element={<AdminLayout />} />
 *  </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
