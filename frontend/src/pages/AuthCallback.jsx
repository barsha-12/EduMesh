import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      // 1. Check if we're already logged in (race condition check)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // 2. If no code and no session, we shouldn't be here
      if (!code) {
        setError('No authentication code found. Please sign in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 3. Exchange code for session
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('OAuth callback error:', error);
          setError(error.message);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data?.session) {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        setError(err.message);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F5E8] dark:bg-[#1c1a16]">
      <div className="text-center space-y-6">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">Authentication Failed</p>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
              <p className="text-xs text-gray-400 mt-4">Redirecting to login...</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] rounded-full animate-pulse mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 font-bold tracking-widest uppercase text-xs">
                Completing sign in...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
