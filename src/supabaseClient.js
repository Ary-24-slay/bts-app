import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://akxszqkarieqgviwvkvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreHN6cWthcmllcWd2aXd2a3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTE4NDQsImV4cCI6MjA4MDUyNzg0NH0.8wzY1NdJoWXA_8epH6oC4yyvynAXS8JUpWn7F8qmZm4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
