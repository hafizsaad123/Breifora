import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { pricingPlans, faqList, testimonialsList } from '../data';
import { supabase } from '../utils/supabase';

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

// Unified save & sync function (updates localStorage + Firestore + Supabase)
export function syncAndSaveData(key: string, value: any) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Update local cache immediately for zero lag
  localStorage.setItem(key, serialized);
  notifyAdminDataChanged();

  // 1. If Firebase cloud mode is active, persist to Firestore in the background
  if (isFirebaseConnected && db) {
    const docId = key.replace('briefora_', '').replace('admin_', '');
    const docRef = doc(db, 'briefora_settings', docId);
    setDoc(docRef, {
      data: value,
      updatedAt: new Date().toISOString(),
    }).catch((err) => {
      console.error(`Firestore Cloud Sync failed for ${key}:`, err);
    });
  }

  // 2. Persist to Supabase if available
  if (supabase) {
    const settingKey = key.replace('briefora_', '').replace('admin_', '');
    Promise.resolve(
      supabase
        .from('app_settings')
        .upsert({ key: settingKey, value: value, updated_at: new Date().toISOString() })
    ).catch(() => {
      // Silently catch if table not yet created in Supabase
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

// Getters
export function getAdminPricing() {
  const saved = localStorage.getItem('briefora_admin_pricing');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return pricingPlans;
}

export function getAdminFaqs() {
  const saved = localStorage.getItem('briefora_admin_faqs');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return faqList;
}

export function getAdminTestimonials() {
  const saved = localStorage.getItem('briefora_admin_testimonials');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return testimonialsList;
}

export function getAdminHeroCopy() {
  const saved = localStorage.getItem('briefora_admin_hero_copy');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...parsed, secondaryCta: parsed.secondaryCta !== undefined ? parsed.secondaryCta : "Invalid Credentials" };
    } catch (e) { console.error(e); }
  }
  return {
    badge: "⚡ Visual Client Onboarding Engine v2.4",
    title: "Client Onboarding Visualized.",
    highlightTitle: "Scope Locked in 10 Minutes.",
    subtitle: "Stop losing profit margins to unbilled revision rounds. Send a magic Briefora link, let clients visually tap their requirements, and automatically lock in signed-off blueprints.",
    primaryCta: "Start Free Onboarding",
    secondaryCta: "Invalid Credentials"
  };
}

export function getSystemConfig() {
  return {
    maintenanceMode: localStorage.getItem('briefora_maintenance') === 'true',
    maintenanceMsg: localStorage.getItem('briefora_maintenance_msg') || 'Briefora is undergoing scheduled system upgrades. We will be back online shortly.',
    signupsEnabled: localStorage.getItem('briefora_signups_enabled') !== 'false',
    broadcastActive: localStorage.getItem('briefora_broadcast_active') === 'true',
    broadcastMsg: localStorage.getItem('briefora_broadcast_msg') || '⚡ Briefora v2.4 Release: Full interactive visual blueprint generator is live!',
  };
}

export function getAdminPrivacyPolicy(): string {
  const saved = localStorage.getItem('briefora_privacy_policy');
  if (saved) return saved;
  return `<h1>Privacy Policy</h1>
<p>Last updated: July 31, 2026</p>
<p>Welcome to Briefora! Your privacy is of paramount importance to us. This Privacy Policy details how we collect, use, and safeguard your personal information when you use our service.</p>`;
}

export function getAdminUsagePolicy(): string {
  const saved = localStorage.getItem('briefora_usage_policy');
  if (saved) return saved;
  return `<h1>Usage Policy</h1>
<p>Last updated: July 31, 2026</p>
<p>This Usage Policy outlines the acceptable parameters and restrictions for utilizing the Briefora workspace, interactive briefs, and client onboarding tools.</p>`;
}

export function getAdminTermsOfService(): string {
  const saved = localStorage.getItem('briefora_terms_of_service');
  if (saved) return saved;
  return `<h1>Terms of Service</h1>
<p>Last updated: July 31, 2026</p>
<p>Please read these Terms of Service ("Terms") carefully before using the Briefora application.</p>`;
}