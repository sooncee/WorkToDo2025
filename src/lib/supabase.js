import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aewnnwhiruatlkvtnwtb.supabase.co';
const SUPABASE_ANON_KEY =
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld25ud2hpcnVhdGxrdnRud3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjQ4MTgsImV4cCI6MjA3ODQ0MDgxOH0.LPnV7cdCMLqzy1B4hHM02Nv-LXSQyJla4V6x9iQaTIA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
