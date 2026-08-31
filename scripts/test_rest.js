async function testRest() {
  const url = 'https://nvjkwoahdtbnvrvqqfyb.supabase.co/auth/v1/admin/users';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52amt3b2FoZHRibnZydnFxZnliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgyMjIxMCwiZXhwIjoyMTAwMzk4MjEwfQ.WzMV59bsXtaMk-yMdMJdvoFbhrH0FvtEO0qQSsot4QQ';
  
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    }
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Data:", data);
}
testRest();
