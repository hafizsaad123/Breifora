import React, { useState } from 'react';
import './Pricing.css';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annually'

  const plans = [
    {
      name: "Free",
      description: "For freelance designers getting started. Your first polished brief.",
      price: "Free",
      priceSub: "Forever",
      buttonText: "Use Briefora for free",
      buttonClass: "btn-secondary",
      subHeading: "Key Benefits Included:",
      features: [
        "1 Active link to test with a real client",
        "10 Visual prompts that replace long discovery calls",
        "Zero-login client access to completely eliminate friction",
        "Fully mobile-responsive layout for on-the-go clients",
        "Instant clean layout view of submitted raw inputs"
      ]
    },
    {
      name: "Pro",
      description: "For active freelancers who need unlimited strategic blueprints and custom branding.",
      price: billingCycle === 'monthly' ? "$9" : "$7",
      priceSub: "Per month",
      buttonText: "Upgrade to Pro",
      buttonClass: "btn-primary",
      isPopular: true,
      subHeading: "Everything in Free Plus:",
      features: [
        "Unlimited active links so you never delete past briefs",
        "Instant AI blueprints extracted from raw client notes",
        "Premium PDF exports to anchor your proposals",
        "Custom studio branding to display your logo on links",
        "AI translation engine for complex visual adjectives"
      ]
    },
    {
      name: "Studio",
      description: "For boutique agencies and design teams demanding complete white-label control.",
      price: billingCycle === 'monthly' ? "$29" : "$24",
      priceSub: "Per month",
      buttonText: "Upgrade to Studio",
      buttonClass: "btn-secondary",
      subHeading: "Everything in Pro Plus:",
      features: [
        "Remove all Briefora branding from client links",
        "Custom domain hosting to use your own studio URL",
        "Add up to 3 team members to collaborate on briefs",
        "Advanced client analytics to track interaction time",
        "Dedicated VIP priority support for urgent projects"
      ]
    }
  ];

  return (
    <div className="pricing-section">
      {/* Header Matrix */}
      <div className="pricing-header">
        <h2>Invest in Creative Clarity.<br />Protect Your Margin.</h2>
        <p>Start for free to streamline your next client onboarding. Upgrade whenever you need unlimited strategic blueprints.</p>
        
        {/* Toggle Controls */}
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`toggle-btn ${billingCycle === 'annually' ? 'active' : ''}`}
            onClick={() => setBillingCycle('annually')}
          >
            Annually
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}>
            {plan.isPopular && <div className="popular-badge">+ Most Popular</div>}
            
            <div className="card-top-header">
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="price-block">
              <span className="price-amount">{plan.price}</span>
              <span className="price-sub">{plan.priceSub}</span>
            </div>

            <button className={`plan-action-btn ${plan.buttonClass}`}>
              {plan.buttonText}
            </button>

            <hr className="divider" />

            <div className="features-block">
              <h4 className="features-subheading">{plan.subHeading}</h4>
              <ul className="features-list">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex}>
                    <span className="check-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}