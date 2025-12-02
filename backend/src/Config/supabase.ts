import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); 

const supabaseUrl = process.env.SUPA_BASE_URL!;
const supabaseKey = process.env.SUPA_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
