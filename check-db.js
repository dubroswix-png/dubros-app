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
  const { data, error, count } = await supabase.from('products').select('*, brands(id, name), categories(id, name)', { count: 'exact' }).limit(5);

  console.log('--- ANON CLIENT TEST ---');
  if (error) {
    console.error('❌ ANON SELECT ERROR (RLS?):', error.message);
  } else {
    console.log('✅ ANON CAN QUERY PRODUCTS! Count:', count, 'Sample length:', data.length);
  }
}

check();
