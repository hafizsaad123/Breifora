// Elegant local fallback database manager using localStorage
export interface FallbackProfile {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  workspace_name?: string;
  free_credits: number;
  subscription_status?: string;
  plan?: string;
  onboarding_completed?: boolean;
  onboarded?: boolean;
}

export interface FallbackBrief {
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  industry: string;
  status: string;
  content: string;
  created_at: string;
}

const DEFAULT_BRIEFS: FallbackBrief[] = [
  {
    id: "brf-default-1",
    user_id: "default",
    title: "Brand Positioning & UX Strategy Deck",
    client_name: "Acme Health",
    industry: "Telehealth & Wellness Tech",
    status: "Active",
    content: `# Brand Positioning & Creative Strategy: Acme Health

## 1. Executive Summary & Brand Positioning
Acme Health is positioning itself as the premier digital medical platform for modern remote-first patients. Our core value proposition centers around immediate medical delivery and frictionless clinical feedback loop systems.

### Brand Values
- Seamless Connectivity
- Empathetic Clinical Integrity
- Radical Technological Clarity

## 2. Strategic Objectives
- Build an interface design system that reduces patient appointment friction by 40%.
- Establish a trustworthy, clean visual presence that commands respect in B2B telehealth circles.
- Launch scalable color palettes and geometric typographic pairing tracks.

## 3. Creative Direction
- **Typography Pairing**: Playfair Display (headings) paired with clean geometric Inter/Plus Jakarta Sans (body).
- **Color Palette**: Royal Cobalt (#1F10E6), Soothing Sage (#E2ECE9), and Deep Onyx (#0F172A).`,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export function getFallbackProfile(userId: string): FallbackProfile {
  const key = `fallback_profile_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return {
    id: userId,
    email: "",
    name: "Saad",
    full_name: "Saad",
    workspace_name: "Saad Creative Studio",
    free_credits: 5,
    subscription_status: "free",
    plan: "Free",
    onboarding_completed: true,
    onboarded: true
  };
}

export function saveFallbackProfile(userId: string, profile: Partial<FallbackProfile>): FallbackProfile {
  const current = getFallbackProfile(userId);
  const updated = { ...current, ...profile };
  localStorage.setItem(`fallback_profile_${userId}`, JSON.stringify(updated));
  return updated;
}

export function getFallbackBriefs(userId: string): FallbackBrief[] {
  const key = `fallback_briefs_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  // Initialize with a default brief if empty
  const defaults = DEFAULT_BRIEFS.map(b => ({ ...b, user_id: userId }));
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

export function saveFallbackBrief(userId: string, brief: Omit<FallbackBrief, 'id' | 'created_at' | 'user_id'> & { id?: string }): FallbackBrief {
  const briefs = getFallbackBriefs(userId);
  const newBrief: FallbackBrief = {
    id: brief.id || `brf-${Date.now()}`,
    user_id: userId,
    title: brief.title,
    client_name: brief.client_name,
    industry: brief.industry,
    status: brief.status || 'Active',
    content: brief.content,
    created_at: new Date().toISOString()
  };
  
  const existingIdx = briefs.findIndex(b => b.id === newBrief.id);
  if (existingIdx >= 0) {
    briefs[existingIdx] = newBrief;
  } else {
    briefs.unshift(newBrief);
  }
  
  localStorage.setItem(`fallback_briefs_${userId}`, JSON.stringify(briefs));
  return newBrief;
}

export function deleteFallbackBrief(userId: string, briefId: string): void {
  const briefs = getFallbackBriefs(userId);
  const filtered = briefs.filter(b => b.id !== briefId);
  localStorage.setItem(`fallback_briefs_${userId}`, JSON.stringify(filtered));
}
