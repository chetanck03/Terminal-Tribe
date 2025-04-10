import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: Error | null;
    data: { session: Session | null; user: User | null };
    emailConfirmationRequired: boolean;
  }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEmailVerified: boolean;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkEmailVerification(session?.user);
      checkUserRole(session?.user?.id);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkEmailVerification(session?.user);
      checkUserRole(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function checkEmailVerification(user: User | null) {
    // Check if user email is confirmed
    if (user) {
      const isConfirmed = user.email_confirmed_at !== null;
      setIsEmailVerified(isConfirmed);
    } else {
      setIsEmailVerified(false);
    }
  }

  async function checkUserRole(userId: string | undefined) {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      console.log('Checking role for user ID:', userId);
      
      // Try to get user data from Supabase User table
      const { data, error } = await supabase
        .from('User')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        
        // If table doesn't exist or user doesn't exist, try the built-in user metadata
        if (user && user.app_metadata && user.app_metadata.role === 'ADMIN') {
          console.log('Setting admin from app_metadata');
          setIsAdmin(true);
          return;
        }
        
        // For development purposes, make the first user an admin if they don't exist
        if (error.code === 'PGRST116') { // No rows returned
          console.log('User not found in DB, trying to create');
          await createUserRecordIfNotExists(userId, user?.email || '', user?.user_metadata?.name);
          
          // After creating, check again
          const { data: newData, error: newError } = await supabase
            .from('User')
            .select('role')
            .eq('id', userId)
            .single();
          
          if (!newError) {
            console.log('User created, role is:', newData.role);
            setIsAdmin(newData.role === 'ADMIN');
            return;
          }
        }
        
        // Default to false for safety
        console.log('Defaulting to non-admin role');
        setIsAdmin(false);
        return;
      }
      
      console.log('User role from database:', data?.role);
      setIsAdmin(data?.role === 'ADMIN');
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      setIsAdmin(false);
    }
  }

  // Helper function to create a user record if it doesn't exist
  async function createUserRecordIfNotExists(userId: string, email: string, name?: string) {
    try {
      // Get current user metadata to check for avatar
      let avatarUrl = null;
      
      if (user?.user_metadata?.avatar) {
        avatarUrl = user.user_metadata.avatar;
      }
      
      // Use the correct table name - "User" instead of "users"
      const { data, error } = await supabase
        .from('User')
        .upsert({
          id: userId,
          email: email,
          name: name || email.split('@')[0], // Use part of email as name if not provided
          role: 'USER',
          avatar: avatarUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create user record:', error);
      throw error;
    }
  }

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // First, check if email is already registered
      // Use the correct table name - "User" instead of "users"
      const { data: existingUsers } = await supabase
        .from('User')
        .select('email')
        .eq('email', email)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        return {
          error: new Error('This email is already registered'),
          data: { session: null, user: null },
          emailConfirmationRequired: false
        };
      }

      // Sign up with Supabase Auth - Enable email confirmation
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin + '/verify-email',
        },
      });

      // If auth signup successful, create user record in our database
      if (!response.error && response.data.user) {
        try {
          await createUserRecordIfNotExists(
            response.data.user.id,
            email,
            name
          );
        } catch (dbError) {
          console.error('Error creating user record:', dbError);
          // Return success anyway since auth was created
        }
      }

      return {
        error: response.error,
        data: response.data,
        emailConfirmationRequired: true
      };
    } catch (error) {
      console.error('Error during signup:', error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error during signup'),
        data: { session: null, user: null },
        emailConfirmationRequired: false
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Update user data in context
  const updateUser = async (userData: any) => {
    if (!user) return;
    
    try {
      // Update user metadata in Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) throw error;
      
      // If avatar is being updated, also update it in the User table
      if (userData.avatar !== undefined) {
        try {
          const { error: dbError } = await supabase
            .from('User')
            .update({
              avatar: userData.avatar,
              updatedAt: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (dbError) {
            console.warn('Failed to update avatar in User table:', dbError);
          }
        } catch (dbError) {
          console.error('Error syncing avatar to database:', dbError);
        }
      }
      
      // Update local state with new user data
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isEmailVerified,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 