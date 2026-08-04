import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, ADMIN_SYNC_EVENT, notifyAdminDataChanged } from '../lib/adminSync';
import { 
  getAdminHeroCopy, 
  getAdminPricing, 
  getAdminFaqs, 
  getAdminTestimonials, 
  getAdminPrivacyPolicy, 
  getAdminUsagePolicy, 
  getAdminTermsOfService, 
  getSystemConfig,
  getAdminLandingPageConfig,
  getAdminCheckoutConfig,
  CheckoutConfig,
  defaultCheckoutConfig
} from '../lib/adminSync';

export interface AppSettings {
  hero_copy: {
    badge: string;
    title: string;
    highlightTitle: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  pricing: any[];
  faqs: any[];
  testimonials: any[];
  privacy_policy: string;
  usage_policy: string;
  terms_of_service: string;
  maintenance: boolean;
  maintenance_msg: string;
  signups_enabled: boolean;
  broadcast_active: boolean;
  broadcast_msg: string;
  landing_page_config: any;
  checkout_config: CheckoutConfig;
}

interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  
  // Initialize from existing local getters (which check localStorage then code defaults)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const sys = getSystemConfig();
    return {
      hero_copy: getAdminHeroCopy(),
      pricing: getAdminPricing(),
      faqs: getAdminFaqs(),
      testimonials: getAdminTestimonials(),
      privacy_policy: getAdminPrivacyPolicy(),
      usage_policy: getAdminUsagePolicy(),
      terms_of_service: getAdminTermsOfService(),
      maintenance: sys.maintenanceMode,
      maintenance_msg: sys.maintenanceMsg,
      signups_enabled: sys.signupsEnabled,
      broadcast_active: sys.broadcastActive,
      broadcast_msg: sys.broadcastMsg,
      landing_page_config: getAdminLandingPageConfig(),
      checkout_config: getAdminCheckoutConfig(),
    };
  });

  const loadAllSettings = async () => {
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) {
        console.error('Error fetching all settings from Supabase:', error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const newSettings = { ...settings };
        
        data.forEach((row) => {
          const key = row.key;
          const val = row.value as any;
          
          // Value extraction (handles wrapped text payloads)
          const extractedValue = (val && typeof val === 'object' && val.text !== undefined) 
            ? val.text 
            : val;

          // Sync back to local storage
          const storageKey = `briefora_admin_${key}`;
          const serialized = typeof extractedValue === 'string' 
            ? extractedValue 
            : JSON.stringify(extractedValue);
          localStorage.setItem(storageKey, serialized);

          // Update state values based on db keys
          if (key === 'hero_copy' || key === 'hero_settings') {
            newSettings.hero_copy = extractedValue;
          } else if (key === 'pricing' || key === 'pricing_settings') {
            newSettings.pricing = extractedValue;
          } else if (key === 'faqs') {
            newSettings.faqs = extractedValue;
          } else if (key === 'testimonials') {
            newSettings.testimonials = extractedValue;
          } else if (key === 'faq_reviews_settings') {
            if (extractedValue && typeof extractedValue === 'object') {
              if (Array.isArray((extractedValue as any).faqs)) {
                newSettings.faqs = (extractedValue as any).faqs;
              }
              if (Array.isArray((extractedValue as any).testimonials)) {
                newSettings.testimonials = (extractedValue as any).testimonials;
              }
            }
          } else if (key === 'privacy_policy') {
            newSettings.privacy_policy = extractedValue;
          } else if (key === 'usage_policy') {
            newSettings.usage_policy = extractedValue;
          } else if (key === 'terms_of_service') {
            newSettings.terms_of_service = extractedValue;
          } else if (key === 'legal_policies') {
            if (extractedValue && typeof extractedValue === 'object') {
              const obj = extractedValue as any;
              if (obj.privacy_policy !== undefined) newSettings.privacy_policy = obj.privacy_policy;
              if (obj.usage_policy !== undefined) newSettings.usage_policy = obj.usage_policy;
              if (obj.terms_of_service !== undefined) newSettings.terms_of_service = obj.terms_of_service;
            }
          } else if (key === 'maintenance') {
            newSettings.maintenance = extractedValue === 'true' || extractedValue === true;
          } else if (key === 'maintenance_msg') {
            newSettings.maintenance_msg = extractedValue;
          } else if (key === 'signups_enabled') {
            newSettings.signups_enabled = extractedValue !== 'false' && extractedValue !== false;
          } else if (key === 'broadcast_active') {
            newSettings.broadcast_active = extractedValue === 'true' || extractedValue === true;
          } else if (key === 'broadcast_msg') {
            newSettings.broadcast_msg = extractedValue;
          } else if (key === 'landing_page_config') {
            newSettings.landing_page_config = extractedValue;
          } else if (key === 'checkout_config') {
            newSettings.checkout_config = { ...defaultCheckoutConfig, ...extractedValue };
          }
        });

        setSettings(newSettings);
        notifyAdminDataChanged();
      }
    } catch (err) {
      console.error('Error in loadAllSettings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Load initial settings
    loadAllSettings();

    // 2. Set up realtime postgres_changes channel
    if (supabase) {
      const channel = supabase
        .channel('app_settings_global_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'app_settings' },
          (payload: any) => {
            console.log('Realtime update received in app_settings:', payload);
            const updatedRow = payload.new || payload.old;
            if (updatedRow && updatedRow.key) {
              const key = updatedRow.key;
              const val = updatedRow.value;
              const extractedValue = (val && typeof val === 'object' && val.text !== undefined)
                ? val.text
                : val;

              // Update local storage so that any non-context components remain in sync
              const storageKey = `briefora_admin_${key}`;
              const serialized = typeof extractedValue === 'string'
                ? extractedValue
                : JSON.stringify(extractedValue);
              localStorage.setItem(storageKey, serialized);
              notifyAdminDataChanged();

              // Update React state
              setSettings((prev) => {
                const updated = { ...prev };
                if (key === 'hero_copy' || key === 'hero_settings') {
                  updated.hero_copy = extractedValue;
                } else if (key === 'pricing' || key === 'pricing_settings') {
                  updated.pricing = extractedValue;
                } else if (key === 'faqs') {
                  updated.faqs = extractedValue;
                } else if (key === 'testimonials') {
                  updated.testimonials = extractedValue;
                } else if (key === 'faq_reviews_settings') {
                  if (extractedValue && typeof extractedValue === 'object') {
                    if (Array.isArray((extractedValue as any).faqs)) {
                      updated.faqs = (extractedValue as any).faqs;
                    }
                    if (Array.isArray((extractedValue as any).testimonials)) {
                      updated.testimonials = (extractedValue as any).testimonials;
                    }
                  }
                } else if (key === 'privacy_policy') {
                  updated.privacy_policy = extractedValue;
                } else if (key === 'usage_policy') {
                  updated.usage_policy = extractedValue;
                } else if (key === 'terms_of_service') {
                  updated.terms_of_service = extractedValue;
                } else if (key === 'legal_policies') {
                  if (extractedValue && typeof extractedValue === 'object') {
                    const obj = extractedValue as any;
                    if (obj.privacy_policy !== undefined) updated.privacy_policy = obj.privacy_policy;
                    if (obj.usage_policy !== undefined) updated.usage_policy = obj.usage_policy;
                    if (obj.terms_of_service !== undefined) updated.terms_of_service = obj.terms_of_service;
                  }
                } else if (key === 'maintenance') {
                  updated.maintenance = extractedValue === 'true' || extractedValue === true;
                } else if (key === 'maintenance_msg') {
                  updated.maintenance_msg = extractedValue;
                } else if (key === 'signups_enabled') {
                  updated.signups_enabled = extractedValue !== 'false' && extractedValue !== false;
                } else if (key === 'broadcast_active') {
                  updated.broadcast_active = extractedValue === 'true' || extractedValue === true;
                } else if (key === 'broadcast_msg') {
                  updated.broadcast_msg = extractedValue;
                } else if (key === 'landing_page_config') {
                  updated.landing_page_config = extractedValue;
                } else if (key === 'checkout_config') {
                  updated.checkout_config = { ...defaultCheckoutConfig, ...extractedValue };
                }
                return updated;
              });
            }
          }
        )
        .subscribe();

      // 3. Listen to local storage sync events (e.g., changes made in AdminPanel locally on same window)
      const handleLocalSync = () => {
        const sys = getSystemConfig();
        setSettings({
          hero_copy: getAdminHeroCopy(),
          pricing: getAdminPricing(),
          faqs: getAdminFaqs(),
          testimonials: getAdminTestimonials(),
          privacy_policy: getAdminPrivacyPolicy(),
          usage_policy: getAdminUsagePolicy(),
          terms_of_service: getAdminTermsOfService(),
          maintenance: sys.maintenanceMode,
          maintenance_msg: sys.maintenanceMsg,
          signups_enabled: sys.signupsEnabled,
          broadcast_active: sys.broadcastActive,
          broadcast_msg: sys.broadcastMsg,
          landing_page_config: getAdminLandingPageConfig(),
          checkout_config: getAdminCheckoutConfig(),
        });
      };

      window.addEventListener(ADMIN_SYNC_EVENT, handleLocalSync);
      window.addEventListener('storage', handleLocalSync);

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener(ADMIN_SYNC_EVENT, handleLocalSync);
        window.removeEventListener('storage', handleLocalSync);
      };
    }
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings: loadAllSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
