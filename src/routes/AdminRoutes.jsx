import { lazy } from "react";
import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

// Lazy Loaded Pages
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Users = lazy(() => import("../pages/Admin/Users"));
const Products = lazy(() => import("../pages/Admin/Products"));
const Categories = lazy(() => import("../pages/Admin/Categories"));
const Orders = lazy(() => import("../pages/Admin/Orders"));
const Reports = lazy(() => import("../pages/Admin/Reports"));
const Settings = lazy(() => import("../pages/Admin/Settings"));

const AdminRoutes = (
  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="products" element={<Products />} />
      <Route path="categories" element={<Categories />} />
      <Route path="orders" element={<Orders />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
);

export default AdminRoutes;


// import { Route } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
// import AdminLayout from "../layouts/AdminLayout";

// import Dashboard from "../pages/Admin/Dashboard";
// import Users from "../pages/Admin/Users";
// import Products from "../pages/Admin/Products";
// import Categories from "../pages/Admin/Categories";
// import Orders from "../pages/Admin/Orders";
// import Reports from "../pages/Admin/Reports";
// import Settings from "../pages/Admin/Settings";

// const AdminRoutes = (
//   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
//     <Route path="/admin" element={<AdminLayout />}>
//       <Route index element={<Dashboard />} />
//       <Route path="users" element={<Users />} />
//       <Route path="products" element={<Products />} />
//       <Route path="categories" element={<Categories />} />
//       <Route path="orders" element={<Orders />} />
//       <Route path="reports" element={<Reports />} />
//       <Route path="settings" element={<Settings />} />
//     </Route>
//   </Route>
// );

// export default AdminRoutes;
