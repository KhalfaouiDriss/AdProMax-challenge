import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdboziaqvnpkjxyfbndv.supabase.co';
const supabaseKey = 'sb_publishable_KnM2c78mu3gbBfPGg2q0ng_9Dg7vIx1';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('delivery_zones').select('*').limit(1);
  if (error) {
    console.log('Supabase connection responded with error (expected if table not created yet):', error.message, error.code);
  } else {
    console.log('Supabase connection succeeded! Data:', data);
  }
}

test();
