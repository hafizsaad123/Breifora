import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials exist
const isCloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isCloudConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isCloudConfigured) {
  console.log('✅ Briefora DB Sync: Connected to Supabase Cloud live!');
} else {
  console.warn('⚠️ Briefora DB Sync: Running in Local Cache Mode. Configure VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in Vercel for live sync.');
}

export const ADMIN_SYNC_EVENT = 'briefora_admin_sync_event';

/**
 * Saves data to Supabase app_settings table AND falls back to localStorage
 */
export async function syncAndSaveData(key: string, value: any) {
  // Always update local cache for instant UI responsiveness
  const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, jsonString);
  window.dispatchEvent(new Event(ADMIN_SYNC_EVENT));

  // Sync to Supabase if configured
  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value: typeof value === 'string' ? { text: value } : value, updated_at: new Date().toISOString() });

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
export async function fetchSyncedData(key: string, fallbackDefault: any) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (data && data.value && !error) {
        return data.value.text !== undefined ? data.value.text : data.value;
      }
    } catch (err) {
      console.error(`Failed to fetch ${key} from Supabase:`, err);
    }
  }

  // Fallback to local storage if not found in cloud
  const local = localStorage.getItem(key);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return local;
    }
  }

  return fallbackDefault;
}

export function getDbSyncStatus() {
  return isCloudConfigured;
}

// Fallback getters for initial state
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