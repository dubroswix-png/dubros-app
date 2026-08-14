import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://nvjkwoahdtbnvrvqqfyb.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52amt3b2FoZHRibnZydnFxZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MjIyMTAsImV4cCI6MjEwMDM5ODIxMH0.vmLozZJDgJcizavDbmEZe4S6muAqbG24lz9uc-zX7rw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
