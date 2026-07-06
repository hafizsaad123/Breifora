import React, { useState } from 'react';
import './FAQ.css';

const faqData = [
  {
    question: "Do my clients need to create an account to fill out a brief?",
    answer: "Never. We completely eliminated friction. Your clients just click your custom workspace link, complete the beautiful interactive discovery flow, and hit submit. Zero logins, zero passwords, and zero excuses for delay."
  },
  {
    question: "Can I completely remove Briefora branding from client links?",
    answer: "Yes, our Studio tier allows full white-labeling control, enabling you to remove all Briefora branding and use your own custom studio domain URL."
  },
  {
    question: "What exactly happens when I hit my active link limit on Free?",
    answer: "Your existing briefs remain active and accessible, but you won't be able to generate new onboarding links until you archive an older active project or upgrade to the Pro tier."
  },
  {
    question: "Does Briefora integrate or replace my current design tools?",
    answer: "Briefora acts as a pre-production tool that protects your scope before production begins. It works side-by-side with your stack, optimizing the front-end intake before moving into Figma or Notion."
  },
  {
    question: "Is there a discount if I choose to pay annually instead of monthly?",
    answer: "Yes! Choosing annual billing saves you over 20% across our Pro and Studio tiers compared to standard month-to-month commitments."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default to match screenshot

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section">
      {/* Header Layout Matrix */}
      <div className="faq-header">
        <h2>Got Questions?<br />We Have Clear Answers.</h2>
        <p>Everything you need to know about how Briefora optimizes your design client onboarding workflow.</p>
      </div>

      {/* Interactive Accordion Frame */}
      <div className="faq-container">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleAccordion(index)}>
                <span className="faq-question">{item.question}</span>
                <span className="faq-icon-btn">
                  {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                </span>
              </button>
              
              <div className="faq-content">
                <div className="faq-inner-text">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}