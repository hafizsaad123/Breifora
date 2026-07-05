import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import AuthLayout from "../layouts/AuthLayout";

import LandingRoutes from "./LandingRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import Loader from "../components/Loader/Loader";

// Lazy Loaded Pages
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const NotFound = lazy(() => import("../pages/Landing/NotFound"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Landing Pages */}
        {LandingRoutes}

        {/* Authentication */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* User Dashboard */}
        {UserRoutes}

        {/* Admin Dashboard */}
        {AdminRoutes}

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}






















// import { Routes, Route } from "react-router-dom";

// import PublicRoute from "./PublicRoute";
// import AuthLayout from "../layouts/AuthLayout";

// import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import ForgotPassword from "../pages/Auth/ForgotPassword";
// import ResetPassword from "../pages/Auth/ResetPassword";
// import NotFound from "../pages/Landing/NotFound";

// import LandingRoutes from "./LandingRoutes";
// import UserRoutes from "./UserRoutes";
// import AdminRoutes from "./AdminRoutes";

// export default function AppRoutes() {
//   return (
//     <Routes>
//       {/* Public marketing pages */}
//       {LandingRoutes}

//       {/* Auth pages - only reachable when logged out */}
//       <Route element={<PublicRoute />}>
//         <Route element={<AuthLayout />}>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//         </Route>
//       </Route>

//       {/* Authenticated user area */}
//       {UserRoutes}

//       {/* Admin-only area */}
//       {AdminRoutes}

//       {/* Catch-all 404 */}
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// }
