const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nvjkwoahdtbnvrvqqfyb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52amt3b2FoZHRibnZydnFxZnliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgyMjIxMCwiZXhwIjoyMTAwMzk4MjEwfQ.WzMV59bsXtaMk-yMdMJdvoFbhrH0FvtEO0qQSsot4QQ';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testOne() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 5 });
  console.log("List users result:", error ? error.message : `Success! Found ${data.users.length} users.`);
}

testOne();
