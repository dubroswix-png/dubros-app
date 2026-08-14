const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
let URL = '';
let KEY = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) URL = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) KEY = line.split('=')[1].trim();
}

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52amt3b2FoZHRibnZydnFxZnliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgyMjIxMCwiZXhwIjoyMTAwMzk4MjEwfQ.WzMV59bsXtaMk-yMdMJdvoFbhrH0FvtEO0qQSsot4QQ';
const supabaseAdmin = createClient(URL, SERVICE_KEY);

async function check() {
  const { data, error } = await supabaseAdmin.from('brands').upsert({ name: 'TEST_BRAND_ADMIN', slug: 'test-brand-admin' }).select();
  console.log('Service Role Upsert Brand Error:', error);
  console.log('Service Role Upsert Brand Data:', data);
}

check();
