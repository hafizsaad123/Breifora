import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { pricingPlans, faqList, testimonialsList } from '../data';

export const ADMIN_SYNC_EVENT = 'briefora_admin_data_changed';

export function notifyAdminDataChanged() {
  window.dispatchEvent(new CustomEvent(ADMIN_SYNC_EVENT));
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db: any = null;
let isFirebaseConnected = false;

// Initialize Firebase if configuration variables are present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseConnected = true;
    console.log('Briefora DB Sync: Connected to cloud Firestore sync engine!');
  } catch (error) {
    console.error('Briefora DB Sync: Failed to initialize Firebase:', error);
  }
} else {
  console.log('Briefora DB Sync: Running in Local Cache Mode. Configure VITE_FIREBASE_API_KEY for live global cloud sync.');
}

// Check database connection status
export function getDbSyncStatus() {
  return {
    connected: isFirebaseConnected,
    mode: isFirebaseConnected ? 'Cloud Live Mode' : 'Local Cache Mode',
    configMissing: !firebaseConfig.apiKey,
    config: firebaseConfig,
  };
}

// Unified save & sync function (updates localStorage + Firestore)
export function syncAndSaveData(key: string, value: any) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Update local cache immediately for zero lag
  localStorage.setItem(key, serialized);
  notifyAdminDataChanged();

  // If cloud mode is active, persist to Firestore in the background
  if (isFirebaseConnected && db) {
    // Standardize Firestore document IDs
    const docId = key
      .replace('briefora_', '')
      .replace('admin_', '');
      
    const docRef = doc(db, 'briefora_settings', docId);
    setDoc(docRef, {
      data: value,
      updatedAt: new Date().toISOString(),
    }).catch((err) => {
      console.error(`Firestore Cloud Sync failed for ${key}:`, err);
    });
  }
}

// Setup live subscription listeners if connected to Firestore
const docIds = [
  'users',
  'briefs',
  'pricing',
  'faqs',
  'testimonials',
  'hero_copy',
  'maintenance',
  'maintenance_msg',
  'signups_enabled',
  'broadcast_msg',
  'broadcast_active',
  'privacy_policy',
  'usage_policy',
  'terms_of_service',
];

if (isFirebaseConnected && db) {
  docIds.forEach((id) => {
    const docRef = doc(db, 'briefora_settings', id);
    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        const value = cloudData?.data;
        if (value === undefined) return;

        const isLegal = id === 'privacy_policy' || id === 'usage_policy' || id === 'terms_of_service';
        const key = `briefora_` + (isLegal ? '' : 'admin_') + id;

        // Check difference before updating to avoid infinite loops
        const localValue = localStorage.getItem(key);
        const serializedCloud = typeof value === 'string' ? value : JSON.stringify(value);

        if (localValue !== serializedCloud) {
          localStorage.setItem(key, serializedCloud);
          notifyAdminDataChanged();
        }
      }
    });
  });
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

// Get Privacy Policy
export function getAdminPrivacyPolicy(): string {
  const saved = localStorage.getItem('briefora_privacy_policy');
  if (saved) return saved;
  return `<h1>Privacy Policy</h1>
<p>Last updated: July 31, 2026</p>
<p>Welcome to Briefora! Your privacy is of paramount importance to us. This Privacy Policy details how we collect, use, and safeguard your personal information when you use our service.</p>

<h2>1. Information We Collect</h2>
<p>We collect information that you directly provide to us when registering for an account, such as your name, email address, password, agency or business name, and payment information. We also collect content you create or upload, such as client briefs, project objectives, style selections, and communication logs.</p>

<h2>2. How We Use Your Information</h2>
<p>We use your information to provide, maintain, and optimize the Briefora service, specifically to:</p>
<ul>
  <li>Authenticate your identity and manage your subscription.</li>
  <li>Synthesize client responses into visual design briefs and interactive blueprints.</li>
  <li>Enable seamless collaboration between agency teams, freelancers, and clients.</li>
  <li>Send essential updates, security alerts, and system notices.</li>
</ul>

<h2>3. Data Storage & Security</h2>
<p>Briefora utilizes secure cloud services and standard industry-encryption protocols to secure your account credentials and workspace datasets. While we maintain rigorous security protections, no method of transmission or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

<h2>4. Sharing of Data</h2>
<p>We do not sell or license your personal information or database uploads to third parties. We only share information with trusted third-party services required to run our applications (such as database hostings, email senders, and payment processors) under strict data protection terms.</p>

<h2>5. Your Choices & Rights</h2>
<p>You can access, update, or permanently delete your account data at any time from your account setting dashboard or by contacting support at support@briefora.com.</p>`;
}

// Get Usage Policy
export function getAdminUsagePolicy(): string {
  const saved = localStorage.getItem('briefora_usage_policy');
  if (saved) return saved;
  return `<h1>Usage Policy</h1>
<p>Last updated: July 31, 2026</p>
<p>This Usage Policy outlines the acceptable parameters and restrictions for utilizing the Briefora workspace, interactive briefs, and client onboarding tools.</p>

<h2>1. Permitted Use</h2>
<p>Briefora is built to facilitate design-discovery, agency-client alignment, and scope definition. You may use our platforms to customize, share, and manage visual design questionnaires, briefs, and client blueprints for legitimate professional, consulting, or personal projects.</p>

<h2>2. Prohibited Activities</h2>
<p>When utilizing our service, you agree not to engage in any of the following prohibited behaviors:</p>
<ul>
  <li><strong>Abusive Conduct:</strong> Using the briefing forms or visual screens to harvest personal information or spam clients with unsolicited advertising.</li>
  <li><strong>System Security:</strong> Attempting to probe, bypass, scan, or compromise the security features, database systems, or server infrastructure.</li>
  <li><strong>Intellectual Property Abuse:</strong> Scraping system templates, visual style selectors, custom interactive components, or platform source code to rebuild competing products.</li>
  <li><strong>Malicious Content:</strong> Distributing viruses, malware, or highly offensive material via visual brief portals or workspace assets.</li>
</ul>

<h2>3. Enforcement & Termination</h2>
<p>Failure to adhere to this Usage Policy may result in temporary suspension, restricted access, or permanent termination of your Briefora account, at our sole discretion, without liability or prior notification.</p>`;
}

// Get Terms of Service
export function getAdminTermsOfService(): string {
  const saved = localStorage.getItem('briefora_terms_of_service');
  if (saved) return saved;
  return `<h1>Terms of Service</h1>
<p>Last updated: July 31, 2026</p>
<p>Please read these Terms of Service ("Terms") carefully before using the Briefora application, website, and related alignment modules operated by Briefora ("us", "we", or "our").</p>

<h2>1. Agreement to Terms</h2>
<p>By registering for an account, purchasing a subscription plan, or accessing our platform, you agree to be bound by these Terms and our Usage Policy. If you disagree with any portion of these terms, you do not have permission to utilize the service.</p>

<h2>2. Accounts and Subscriptions</h2>
<p>To access full workspace features, you must create a verified account. You are solely responsible for maintaining account safety, protecting password details, and reporting unauthorized entries. Some services require premium plans (e.g. Pro or Studio) which are auto-billed recurringly on your chosen interval.</p>

<h2>3. Client Portals and Shared Briefs</h2>
<p>Briefora provides magic links that permit external clients to select project parameters. You retain ownership of all inputs provided. We grant you a limited, non-exclusive license to share and export these generated brief documents to your clients. You agree that client selections represent official alignment scopes for your projects.</p>

<h2>4. Limitation of Liability</h2>
<p>In no event shall Briefora, its directors, employees, partners, or suppliers be liable for any indirect, incidental, special, or consequential damages resulting from your use of, or inability to use, our service, including lost profits, dataset errors, or client project disputes.</p>

<h2>5. Modifications & Governing Law</h2>
<p>We reserve the right to amend these Terms at any time. Changes will be posted to this page with a revised date stamp. These terms are governed and construed in accordance with standard internet business statutes.</p>`;
}
