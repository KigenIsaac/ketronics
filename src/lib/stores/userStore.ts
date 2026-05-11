import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'manager';
  full_name?: string;
}

interface UserStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    if (!isSupabaseConfigured()) {
      set({ user: null, loading: false });
      return;
    }

    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) {
        set({ user: null, loading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ user: null, loading: false });
        return;
      }

      set({ user: { ...authUser, ...profile }, loading: false });
    } catch (error) {
      console.error('Error in fetchUser:', error);
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
