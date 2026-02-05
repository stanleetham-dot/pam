import { createClient } from '@supabase/supabase-js';

// User provided credentials
const supabaseUrl = 'https://tnkvwdopnmchvnyeecws.supabase.co';
const supabaseKey = 'sb_publishable_oR7Br8S3fYQqjVUY2e5Ayg_K1bfXkKZ';

export const supabase = createClient(supabaseUrl, supabaseKey);