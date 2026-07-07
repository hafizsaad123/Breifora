import Hero from "../../components/Hero/Hero";
import Features from "./HomeComponent/Features";
import Slider from "./HomeComponent/slider";

export default function Home() {
  return (
    <div>
      <Hero />
      <div style={{ width: '100%', border: '1px solid var(--border-color)' }} className="bar_line"></div>
      <Slider />
      <Features />
      {/* Benefits, How It Works, Pricing, Testimonials, FAQs sections go here */}
    </div>
  );
}
