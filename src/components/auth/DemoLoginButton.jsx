import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui';

const DemoLoginButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);
  const { signInAsDemo } = useAuthStore();

  useEffect(() => {
    // Check if demo was already used
    const used = localStorage.getItem('edumesh_demo_used') === 'true';
    setDemoUsed(used);
  }, []);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const result = await signInAsDemo();
      if (result.error) {
        setDemoUsed(true);
        if (onError) onError(result.error);
      } else if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (error) {
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDemoLogin}
      disabled={loading || demoUsed}
      fullWidth
      variant={demoUsed ? 'outlined' : 'text'}
      className={demoUsed ? 'opacity-50 cursor-not-allowed' : ''}
    >
      {demoUsed ? 'Demo Already Used' : loading ? 'Loading Demo...' : 'Try Demo'}
    </Button>
  );
};

export default DemoLoginButton;
