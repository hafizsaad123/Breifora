import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ymqdjcrjegvhoausczxo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_K5DFErOJowJEGUSZ2r3_8w_u6Yw-Nck';

export const supabase = createClient(supabaseUrl, supabaseKey);