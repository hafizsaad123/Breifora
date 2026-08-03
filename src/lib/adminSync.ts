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

export function notifyAdminDataChanged() {
  window.dispatchEvent(new Event(ADMIN_SYNC_EVENT));
}

/**
 * Saves data to Supabase app_settings table AND updates localStorage
 */
export async function syncAndSaveData(key: string, value: unknown): Promise<void> {
  const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Normalize local storage key naming
  const dbKey = key.replace(/^briefora_admin_/, '').replace(/^briefora_/, '');
  const localStorageKey = `briefora_admin_${dbKey}`;
  
  localStorage.setItem(localStorageKey, jsonString);
  notifyAdminDataChanged();

  if (supabase) {
    try {
      const payload = typeof value === 'string' ? { text: value } : (value as Record<string, unknown>);
      
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: dbKey, value: payload, updated_at: new Date().toISOString() });

      if (error) {
        console.error(`Error syncing key "${dbKey}" to Supabase:`, error.message);
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
  const dbKey = key.replace(/^briefora_admin_/, '').replace(/^briefora_/, '');
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', dbKey)
        .single();

      if (data && data.value && !error) {
        const val = data.value as Record<string, unknown>;
        const result = (val.text !== undefined ? val.text : val) as T;
        
        // Update local storage cache
        const localStorageKey = `briefora_admin_${dbKey}`;
        localStorage.setItem(localStorageKey, typeof result === 'string' ? result : JSON.stringify(result));
        return result;
      }
    } catch (err) {
      console.error(`Failed to fetch ${dbKey} from Supabase:`, err);
    }
  }

  const localKey = `briefora_admin_${dbKey}`;
  const local = localStorage.getItem(localKey) || localStorage.getItem(key);
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
  const savedUnified = localStorage.getItem('briefora_admin_hero_settings');
  if (savedUnified) {
    try {
      return JSON.parse(savedUnified);
    } catch {}
  }
  const saved = localStorage.getItem('briefora_admin_hero_copy');
  if (saved) {
    try { 
      return JSON.parse(saved);
    } catch {}
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

export const getAdminPrivacyPolicy = () => {
  const savedUnified = localStorage.getItem('briefora_admin_legal_policies');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && parsed.privacy_policy) return parsed.privacy_policy;
    } catch {}
  }
  return localStorage.getItem('briefora_admin_privacy_policy') || localStorage.getItem('briefora_privacy_policy') || 'Standard Privacy Policy content for Briefora users.';
};

export const getAdminUsagePolicy = () => {
  const savedUnified = localStorage.getItem('briefora_admin_legal_policies');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && parsed.usage_policy) return parsed.usage_policy;
    } catch {}
  }
  return localStorage.getItem('briefora_admin_usage_policy') || localStorage.getItem('briefora_usage_policy') || 'Standard Usage Policy content for Briefora services.';
};

export const getAdminTermsOfService = () => {
  const savedUnified = localStorage.getItem('briefora_admin_legal_policies');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && parsed.terms_of_service) return parsed.terms_of_service;
    } catch {}
  }
  return localStorage.getItem('briefora_admin_terms_of_service') || localStorage.getItem('briefora_terms_of_service') || 'Standard Terms of Service agreement for Briefora.';
};

export function getAdminPricing() {
  const savedUnified = localStorage.getItem('briefora_admin_pricing_settings');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }
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
    } catch (e) { 
      console.error(e);
    }
  }
  return pricingPlans.map(plan => ({
    ...plan,
    priceMonthly: plan.priceMonthly ?? 0,
    priceAnnual: plan.priceAnnual ?? Math.round((plan.priceMonthly ?? 0) * 0.8),
    price: plan.priceMonthly ?? 0
  }));
}

export function getAdminFaqs() {
  const savedUnified = localStorage.getItem('briefora_admin_faq_reviews_settings');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && Array.isArray(parsed.faqs)) {
        return parsed.faqs.map((item: any, index: number) => ({
          id: item.id || `faq-${index}`,
          question: item.question || item.q || '',
          answer: item.answer || item.a || '',
          q: item.question || item.q || '',
          a: item.answer || item.a || '',
        }));
      }
    } catch {}
  }
  const saved = localStorage.getItem('briefora_admin_faqs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, index: number) => ({
          id: item.id || `faq-${index}`,
          question: item.question || item.q || '',
          answer: item.answer || item.a || '',
          q: item.question || item.q || '',
          a: item.answer || item.a || '',
        }));
      }
    } catch (e) { 
      console.error(e);
    }
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
  const savedUnified = localStorage.getItem('briefora_admin_faq_reviews_settings');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && Array.isArray(parsed.testimonials)) {
        return parsed.testimonials;
      }
    } catch {}
  }
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

export function getSystemConfig() {
  const m1 = localStorage.getItem('briefora_admin_maintenance');
  const m2 = localStorage.getItem('briefora_maintenance');
  const isMaintenance = m1 === 'true' || m2 === 'true';
  return {
    maintenanceMode: isMaintenance,
    maintenanceMsg: localStorage.getItem('briefora_admin_maintenance_msg') || localStorage.getItem('briefora_maintenance_msg') || 'Briefora is undergoing scheduled system upgrades. We will be back online shortly.',
    signupsEnabled: localStorage.getItem('briefora_admin_signups_enabled') !== 'false',
    broadcastActive: localStorage.getItem('briefora_admin_broadcast_active') === 'true' || localStorage.getItem('briefora_broadcast_active') === 'true',
    broadcastMsg: localStorage.getItem('briefora_admin_broadcast_msg') || localStorage.getItem('briefora_broadcast_msg') || '⚡ Briefora v2.4 Release: Full interactive visual blueprint generator is live!',
  };
}

/**
 * Fetch a single setting key directly from Supabase app_settings table
 */
export async function fetchSettingFromSupabase(key: string) {
  if (!supabase) return null;
  try {
    const dbKey = key.replace(/^briefora_admin_/, '').replace(/^briefora_/, '');
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', dbKey)
      .single();

    if (error || !data) return null;

    const settingKey = `briefora_admin_${dbKey}`;
    const serialized = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
    localStorage.setItem(settingKey, serialized);
    notifyAdminDataChanged();

    return data.value;
  } catch (err) {
    console.error(`Error fetching setting ${key} from Supabase:`, err);
    return null;
  }
}

/**
 * Listen live to real-time database changes in Supabase
 */
export function subscribeToSupabaseChanges(onUpdate: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('app_settings_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_settings' },
      (payload: any) => {
        if (payload.new && payload.new.key) {
          const settingKey = `briefora_admin_${payload.new.key}`;
          const serialized = typeof payload.new.value === 'string' 
            ? payload.new.value 
            : JSON.stringify(payload.new.value);
          
          localStorage.setItem(settingKey, serialized);
          notifyAdminDataChanged();
        }
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

