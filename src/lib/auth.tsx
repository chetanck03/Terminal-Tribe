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
      // Use the correct table name - "User" instead of "users"
      const { data, error } = await supabase
        .from('User')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If there's an error about the table not existing, handle it gracefully
        if (error.code === '42P01') { // PostgreSQL error code for "relation does not exist"
          console.warn('User table does not exist yet. Creating it with Prisma migrations is recommended.');
          
          // If this is the first user, you might want to make them an admin
          // For now, we'll set isAdmin to false for safety
          setIsAdmin(false);
          return;
        }
        
        // Handle "no rows returned" error case
        if (error.code === 'PGRST116') {
          console.warn('User record not found in database, creating it now...');
          
          if (user && user.email) {
            try {
              await createUserRecordIfNotExists(userId, user.email, user.user_metadata?.name);
              // After creating, try to fetch the user role again
              const { data: newData, error: newError } = await supabase
                .from('User')
                .select('role')
                .eq('id', userId)
                .single();
              
              if (!newError) {
                setIsAdmin(newData.role === 'ADMIN');
                return;
              }
            } catch (createError) {
              console.error('Error creating user record:', createError);
            }
          }
          
          setIsAdmin(false);
          return;
        }
        
        // For other errors, throw them
        throw error;
      }
      
      setIsAdmin(data?.role === 'ADMIN');
    } catch (error) {
      console.error('Error checking user role:', error);
      
      // Set to false by default for safety
      setIsAdmin(false);
      
      // Try to create the user record in case it doesn't exist
      if (user && user.email) {
        try {
          await createUserRecordIfNotExists(userId, user.email, user.user_metadata?.name);
        } catch (createError) {
          console.error('Error creating user record:', createError);
        }
      }
    }
  }

  // Helper function to create a user record if it doesn't exist
  async function createUserRecordIfNotExists(userId: string, email: string, name?: string) {
    try {
      // Use the correct table name - "User" instead of "users"
      const { data, error } = await supabase
        .from('User')
        .upsert({
          id: userId,
          email: email,
          name: name || email.split('@')[0], // Use part of email as name if not provided
          role: 'USER',
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

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isEmailVerified,
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