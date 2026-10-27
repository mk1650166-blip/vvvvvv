import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getSupabaseClient } from './services/supabase.ts';
import { SyncManager } from './services/syncManager.ts';

// Initialize Supabase Client properly on app startup with offline resilience
try {
  getSupabaseClient();
  // Trigger initial background sync without blocking UI mount
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      SyncManager.syncAll().catch((err) => {
        console.log('[Supabase Startup] Running in local offline mode:', err?.message || err);
      });
    }, 100);
  }
} catch (e) {
  console.warn('[Supabase Setup Notice]', e);
}

createRoot(document.getElementById('root')!).render(<App />);

