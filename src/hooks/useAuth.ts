import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  student_id: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, student_id')
      .eq('id', userId as any)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as unknown as Profile);
    } else if (!data) {
      // Profile doesn't exist - auto-create from user metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const email = authUser.email || '';
        const studentId = email.replace('@student.local', '').toUpperCase();
        const name = authUser.user_metadata?.name || studentId;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: name,
            student_id: studentId,
          } as any)
          .select('id, name, student_id')
          .single();

        if (!insertError && newProfile) {
          setProfile(newProfile as unknown as Profile);
        } else {
          console.error('Error creating profile:', insertError);
        }
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!session,
  };
};
