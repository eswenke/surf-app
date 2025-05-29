import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (username: string) => Promise<{ error: any | null }>;
  getUserProfile: () => Promise<{ username: string | null, error: any | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    // First create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Store username in user metadata
        },
      },
    });

    if (error) return { error };
    
    // If signup is successful and we have a user, also create a profile entry
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id, 
          username: username,
          created_at: new Date().toISOString()
        }]);
      
      if (profileError) return { error: profileError };
    }
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Function to update a user's profile (username)
  const updateProfile = async (username: string) => {
    if (!user) return { error: new Error('No user logged in') };
    
    // Update user metadata
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { username }
    });
    
    if (metadataError) return { error: metadataError };
    
    // Update profile in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        username,
        updated_at: new Date().toISOString()
      });
    
    return { error: profileError };
  };
  
  // Function to get a user's profile data
  const getUserProfile = async () => {
    if (!user) return { username: null, error: new Error('No user logged in') };
    
    // First try to get from metadata
    const username = user.user_metadata?.username;
    if (username) return { username, error: null };
    
    // If not in metadata, try to get from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    
    return { 
      username: data?.username || null, 
      error 
    };
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};