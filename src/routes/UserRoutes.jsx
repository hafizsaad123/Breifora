import { lazy } from "react";
import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import UserLayout from "../layouts/UserLayout";

// Lazy Loaded Pages
const Dashboard = lazy(() => import("../pages/User/Dashboard"));
const Profile = lazy(() => import("../pages/User/Profile"));
const Orders = lazy(() => import("../pages/User/Orders"));
const Settings = lazy(() => import("../pages/User/Settings"));
const Notifications = lazy(() => import("../pages/User/Notifications"));

const UserRoutes = (
  <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
    <Route path="/dashboard" element={<UserLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="orders" element={<Orders />} />
      <Route path="settings" element={<Settings />} />
      <Route path="notifications" element={<Notifications />} />
    </Route>
  </Route>
);

export default UserRoutes;




// import { Route } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
// import UserLayout from "../layouts/UserLayout";

// import Dashboard from "../pages/User/Dashboard";
// import Profile from "../pages/User/Profile";
// import Orders from "../pages/User/Orders";
// import Settings from "../pages/User/Settings";
// import Notifications from "../pages/User/Notifications";

// const UserRoutes = (
//   <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
//     <Route path="/dashboard" element={<UserLayout />}>
//       <Route index element={<Dashboard />} />
//       <Route path="profile" element={<Profile />} />
//       <Route path="orders" element={<Orders />} />
//       <Route path="settings" element={<Settings />} />
//       <Route path="notifications" element={<Notifications />} />
//     </Route>
//   </Route>
// );

// export default UserRoutes;
