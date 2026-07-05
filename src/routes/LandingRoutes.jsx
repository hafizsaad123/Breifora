import { Route } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";

import Home from "../pages/Landing/Home";
import About from "../pages/Landing/About";
import Services from "../pages/Landing/Services";
import Pricing from "../pages/Landing/Pricing";
import Contact from "../pages/Landing/Contact";

// Exported as an array of <Route> elements to be spread inside AppRoutes'
// <Routes> tree (keeps each domain's routes co-located with its layout).
const LandingRoutes = (
  <Route element={<LandingLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/contact" element={<Contact />} />
  </Route>
);

export default LandingRoutes;
