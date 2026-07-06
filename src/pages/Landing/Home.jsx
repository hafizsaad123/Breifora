import Hero from "../../components/Hero/Hero";
import BrieforaCTA from "./HomeComponent/BrieforaCTA";
import Comparison from "./HomeComponent/Comparison";
import FAQ from "./HomeComponent/FAQ";
import Features from "./HomeComponent/Features";
import Pricing from "./HomeComponent/Pricing";
import Slider from "./HomeComponent/slider";
import Workflow from "./HomeComponent/Workflow";

export default function Home() {
  return (
    <div>
      <Hero />
      <div style={{ width: '100%', border: '1px solid var(--border-color)' }} className="bar_line"></div>
      <Slider />
      <Features />
      <Workflow />
      <Comparison />
      <Pricing />
      <FAQ />
      <BrieforaCTA />
      {/* Benefits, How It Works, Pricing, Testimonials, FAQs sections go here */}
    </div>
  );
}
