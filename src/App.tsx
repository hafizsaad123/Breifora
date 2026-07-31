/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoCloud from './components/LogoCloud';
import BentoGrid from './components/BentoGrid';
import ProcessSteps from './components/ProcessSteps';
import ComparisonMatrix from './components/ComparisonMatrix';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import FooterCTA from './components/FooterCTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-brand-primary/10 selection:text-brand-primary selection:font-bold">
      {/* Navigation Bar */}
      <Navbar />

      <main className="relative">
        {/* Main Hero Section with Product Mockup View */}
        <Hero />

        {/* Social Proof Logo Cloud */}
        <LogoCloud />

        {/* Features Bento Grid Section */}
        <BentoGrid />

        {/* Chronological Process Section */}
        <ProcessSteps />

        {/* Feature Comparison Matrix Table */}
        <ComparisonMatrix />

        {/* Pricing Component (With Monthly/Annual Toggle) */}
        <Pricing />

        {/* Staggered Testimonials Wall of Love */}
        <Testimonials />

        {/* FAQ Single-Column Accordion */}
        <FAQ />

        {/* The Grand Finale Banner CTA */}
        <FooterCTA />
      </main>

      {/* Footer Menu */}
      <Footer />
    </div>
  );
}
