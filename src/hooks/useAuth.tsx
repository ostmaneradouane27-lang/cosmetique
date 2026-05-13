import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '@/types';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, handle gracefully
          return;
        }
        throw error;
      }

      if (data) {
        setUser(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
       // If this specific user isn't found, automatically sign them up once
      if (email === 'ostmaneradouane27@gmail.com' && (error.message.includes('Invalid login credentials'))) {
        console.log("Setting up master owner account...");
        return signup(email, pass, 'Owner');
      }
      throw error;
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { display_name: name }
        }
      });

      if (signUpError) throw signUpError;
      if (!authUser) throw new Error('Signup failed');

      const newUser: UserProfile = {
        uid: authUser.id,
        email,
        displayName: name,
        role: email === 'ostmaneradouane27@gmail.com' ? UserRole.OWNER : UserRole.CASHIER,
        storeId: 'pending',
        createdAt: Date.now(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([newUser]);

      if (profileError) throw profileError;
      
      setUser(newUser);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'profiles');
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
