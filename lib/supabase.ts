import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const getSupabaseConfig = () => {
  const config = Constants.expoConfig?.extra || Constants.manifest?.extra;
  return {
    url: config?.supabaseUrl || 'https://tehaefdnkovvtoxncxjq.supabase.co',
    anonKey: config?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaGFlZmRua292dnRveG5jeGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODYxODYsImV4cCI6MjA3ODk2MjE4Nn0.M4UYtXJysDFRZk2ZThdrIrjS253451am6nvCd6TUlHA'
  };
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
