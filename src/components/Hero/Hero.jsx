import { Sparkles } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import DashboardPreview from "./DashboardPreview";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__sky" aria-hidden="true">
        <span className="hero__cloud hero__cloud--1" />
        <span className="hero__cloud hero__cloud--2" />
        <span className="hero__cloud hero__cloud--3" />
      </div>

      <div className="hero__content">
        <Navbar />

        <div className="hero__copy">
          <span className="hero__badge">
            <Sparkles size={14} strokeWidth={2.25} color="var(--text-primary)" />
            AI Client Discovery for Brand Designers
          </span>

          <h1 className="hero__title">
            Turn Vague Client Ideas Into
            <br />
            Clear Brand Strategy
          </h1>

          <p className="hero__subtitle">
            Stop chasing confusing feedback and endless revisions. Breifora
            transforms messy client thoughts into strategic creative
            direction before the first concept is designed.
          </p>

          <div className="hero__actions">
            <button type="button" className="btn btn--primary btn--lg">
              Start Free
            </button>
            <button type="button" className="btn btn--outline btn--lg">
              See Demo
            </button>
          </div>

          <p className="hero__note">No credit card required</p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
