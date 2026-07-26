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
  const tableNames = ['countries', 'paises', 'pais', 'latam_countries', 'locations', 'products', 'articulos', 'marcas'];
  for (const name of tableNames) {
    const { data, error } = await supabase.from(name).select('*').limit(5);
    if (!error) {
      console.log(`Table [${name}] exists! Rows count:`, data.length);
      if (data.length > 0) console.log(data);
    } else {
      console.log(`Table [${name}] error:`, error.message);
    }
  }
}

check();
