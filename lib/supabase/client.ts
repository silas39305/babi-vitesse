import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// On initialise et on exporte l'instance "supabase" prête à l'emploi
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
