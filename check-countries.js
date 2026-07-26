const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
let URL = '';
let KEY = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) URL = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) KEY = line.split('=')[1].trim();
}

const supabase = createClient(URL, KEY);

async function check() {
  const { data, error } = await supabase.from('countries').select('*');
  console.log('Countries from Supabase:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

check();
