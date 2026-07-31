import { pricingPlans, faqList, testimonialsList } from '../data';

export const ADMIN_SYNC_EVENT = 'briefora_admin_data_changed';

export function notifyAdminDataChanged() {
  window.dispatchEvent(new CustomEvent(ADMIN_SYNC_EVENT));
}

// Get Pricing
export function getAdminPricing() {
  const saved = localStorage.getItem('briefora_admin_pricing');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return pricingPlans;
}

// Get FAQs
export function getAdminFaqs() {
  const saved = localStorage.getItem('briefora_admin_faqs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return faqList;
}

// Get Testimonials
export function getAdminTestimonials() {
  const saved = localStorage.getItem('briefora_admin_testimonials');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return testimonialsList;
}

// Get Hero Copy
export function getAdminHeroCopy() {
  const saved = localStorage.getItem('briefora_admin_hero_copy');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...parsed, secondaryCta: parsed.secondaryCta !== undefined ? parsed.secondaryCta : "Invalid Credentials" };
    } catch (e) {
      console.error(e);
    }
  }
  return {
    badge: "⚡ Visual Client Onboarding Engine v2.4",
    title: "Client Onboarding Visualized.",
    highlightTitle: "Scope Locked in 10 Minutes.",
    subtitle: "Stop losing profit margins to unbilled revision rounds. Send a magic Breifora link, let clients visually tap their requirements, and automatically lock in signed-off blueprints.",
    primaryCta: "Start Free Onboarding",
    secondaryCta: "Invalid Credentials"
  };
}

// Get System Toggles
export function getSystemConfig() {
  return {
    maintenanceMode: localStorage.getItem('briefora_maintenance') === 'true',
    maintenanceMsg: localStorage.getItem('briefora_maintenance_msg') || 'Breifora is undergoing scheduled system upgrades. We will be back online shortly.',
    signupsEnabled: localStorage.getItem('briefora_signups_enabled') !== 'false',
    broadcastActive: localStorage.getItem('briefora_broadcast_active') === 'true',
    broadcastMsg: localStorage.getItem('briefora_broadcast_msg') || '⚡ Breifora v2.4 Release: Full interactive visual blueprint generator is live!',
  };
}
