import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_SESSION_KEY = 'visually_admin_session';

export interface AdminUser {
  email: string;
  role: 'admin';
  loggedInAt: string;
  provider: 'supabase' | 'demo';
}

// Default fallback credentials for testing / demo mode
export const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@visually.med',
  password: 'admin123',
};

/**
 * Authenticate admin with email & password
 */
export async function loginAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const email = emailInput.trim().toLowerCase();

  // 1. Try Supabase Auth if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

      if (!error && data.user) {
        const user: AdminUser = {
          email: data.user.email || email,
          role: 'admin',
          loggedInAt: new Date().toISOString(),
          provider: 'supabase',
        };
        saveSession(user);
        return { success: true, user };
      }
    } catch (err: any) {
      console.warn('Supabase Auth attempt failed, checking fallback auth:', err.message);
    }
  }

  // 2. Demo / Local Auth Check
  if (
    (email === DEMO_ADMIN_CREDENTIALS.email || email === 'admin@visually.com' || email === 'admin') &&
    passwordInput === DEMO_ADMIN_CREDENTIALS.password
  ) {
    const user: AdminUser = {
      email: email.includes('@') ? email : 'admin@visually.med',
      role: 'admin',
      loggedInAt: new Date().toISOString(),
      provider: 'demo',
    };
    saveSession(user);
    return { success: true, user };
  }

  return {
    success: false,
    error: 'Invalid admin email or password. (Demo credentials: admin@visually.med / admin123)',
  };
}

/**
 * Check if admin is currently authenticated
 */
export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save auth session to localStorage
 */
function saveSession(user: AdminUser) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

/**
 * Log out admin
 */
export async function logoutAdmin(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
}
