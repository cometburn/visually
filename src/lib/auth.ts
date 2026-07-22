import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_SESSION_KEY = 'visually_admin_session';

export interface AdminUser {
  email: string;
  role: 'admin';
  loggedInAt: string;
  provider: 'supabase';
}

export async function loginAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.',
    };
  }

  const email = emailInput.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordInput,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || 'Invalid credentials.',
      };
    }

    const user: AdminUser = {
      email: data.user.email || email,
      role: 'admin',
      loggedInAt: new Date().toISOString(),
      provider: 'supabase',
    };

    saveSession(user);
    return { success: true, user };
  } catch {
    console.error('Supabase Auth error');
    return {
      success: false,
      error: 'An unexpected authentication error occurred.',
    };
  }
}

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

function saveSession(user: AdminUser) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
  } catch {
    console.error('Failed to save admin session');
  }
}

export async function logoutAdmin(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}
