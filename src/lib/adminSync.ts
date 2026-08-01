import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { pricingPlans, faqList, testimonialsList } from '../data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Check if credentials exist
const isCloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isCloudConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isCloudConfigured) {
  console.log('✅ Briefora DB Sync: Connected to Supabase Cloud live!');
} else {
  console.warn('⚠️ Briefora DB Sync: Running in Local Cache Mode. Configure VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in Vercel for live sync.');
}

export const ADMIN_SYNC_EVENT = 'briefora_admin_sync_event';

/**
 * Saves data to Supabase app_settings table AND updates localStorage
 */
export async function syncAndSaveData(key: string, value: unknown): Promise<void> {
  const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, jsonString);
  window.dispatchEvent(new Event(ADMIN_SYNC_EVENT));

  if (supabase) {
    try {
      const payload = typeof value === 'string' ? { text: value } : (value as Record<string, unknown>);
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value: payload, updated_at: new Date().toISOString() });

      if (error) {
        console.error(`Error syncing key "${key}" to Supabase:`, error.message);
      }
    } catch (err) {
      console.error('Supabase sync exception:', err);
    }
  }
}

/**
 * Loads data from Supabase app_settings table or local fallback
 */
export async function fetchSyncedData<T>(key: string, fallbackDefault: T): Promise<T> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (data && data.value && !error) {
        const val = data.value as Record<string, unknown>;
        return (val.text !== undefined ? val.text : val) as T;
      }
    } catch (err) {
      console.error(`Failed to fetch ${key} from Supabase:`, err);
    }
  }

  const local = localStorage.getItem(key);
  if (local) {
    try {
      return JSON.parse(local) as T;
    } catch {
      return local as unknown as T;
    }
  }

  return fallbackDefault;
}

export function getDbSyncStatus(): boolean {
  return isCloudConfigured;
}

export const getAdminHeroCopy = () => {
  const saved = localStorage.getItem('briefora_admin_hero_copy');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return {
    badge: '⚡ AI Client Discovery for Brand Designers',
    title: 'Turn Vague Client Ideas Into',
    highlightTitle: 'Clear Brand Strategy',
    subtitle: 'Stop chasing confusing feedback and endless revisions. Briefora transforms messy client thoughts into strategic creative direction before the first concept is designed.',
    primaryCta: 'Start for free',
    secondaryCta: 'See How It Works',
  };
};

export const getAdminPrivacyPolicy = () => localStorage.getItem('briefora_privacy_policy') || 'Standard Privacy Policy content for Briefora users.';
export const getAdminUsagePolicy = () => localStorage.getItem('briefora_usage_policy') || 'Standard Usage Policy content for Briefora services.';
export const getAdminTermsOfService = () => localStorage.getItem('briefora_terms_of_service') || 'Standard Terms of Service agreement for Briefora.';

export function getAdminPricing() {
  const saved = localStorage.getItem('briefora_admin_pricing');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(plan => {
          const priceMonthly = plan.priceMonthly !== undefined ? plan.priceMonthly : (plan.price !== undefined ? plan.price : 0);
          const priceAnnual = plan.priceAnnual !== undefined ? plan.priceAnnual : Math.round(priceMonthly * 0.8);
          return {
            ...plan,
            priceMonthly,
            priceAnnual,
            price: priceMonthly
          };
        });
      }
    } catch (e) { console.error(e); }
  }
  return pricingPlans.map(plan => ({
    ...plan,
    price: plan.priceMonthly
  }));
}

export function getAdminFaqs() {
  const saved = localStorage.getItem('briefora_admin_faqs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          id: item.id || `faq-${index}`,
          question: item.question || item.q || '',
          answer: item.answer || item.a || '',
          q: item.question || item.q || '',
          a: item.answer || item.a || '',
        }));
      }
    } catch (e) { console.error(e); }
  }
  return faqList.map((item, index) => ({
    id: item.id || `faq-${index}`,
    question: item.question,
    answer: item.answer,
    q: item.question,
    a: item.answer,
  }));
}

export function getAdminTestimonials() {
  const saved = localStorage.getItem('briefora_admin_testimonials');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return testimonialsList;
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