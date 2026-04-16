import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Modal, Input, Button } from '../ui';
import GoogleLoginButton from './GoogleLoginButton';
import DemoLoginButton from './DemoLoginButton';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuthStore();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn({ email, password });
      if (result.error) {
        setErrors({ form: result.error });
      } else {
        if (onSuccess) onSuccess(result.user);
        onClose();
      }
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';

    if (!displayName) newErrors.displayName = 'Name is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp({ email, password, displayName });
      if (result.error) {
        setErrors({ form: result.error });
      } else {
        if (onSuccess) onSuccess(result.data?.user);
        // Note: Supabase requires email confirmation. User will need to verify email.
        setErrors({ form: 'Please check your email to confirm your account.' });
      }
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTab('signin');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Welcome to EduMesh" size="md">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            setTab('signin');
            setErrors({});
          }}
          className={`
            px-4 py-3 font-medium border-b-2 transition-colors -mb-px
            ${tab === 'signin'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setTab('signup');
            setErrors({});
          }}
          className={`
            px-4 py-3 font-medium border-b-2 transition-colors -mb-px
            ${tab === 'signup'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          Sign Up
        </button>
      </div>

      {/* General Error */}
      {errors.form && (
        <div
          className={`
            p-3 rounded-lg mb-4 text-sm
            ${errors.form.includes('check your email')
              ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-300'
            }
          `}
        >
          {errors.form}
        </div>
      )}

      {/* Sign In Form */}
      {tab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            icon={Mail}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            icon={Lock}
          />

          <Button type="submit" fullWidth disabled={isLoading} className="mt-6">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      )}

      {/* Sign Up Form */}
      {tab === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setErrors({ ...errors, displayName: '' });
            }}
            error={errors.displayName}
            icon={User}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            icon={Mail}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            icon={Lock}
            helperText="At least 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors({ ...errors, confirmPassword: '' });
            }}
            error={errors.confirmPassword}
            icon={Lock}
          />

          <Button type="submit" fullWidth disabled={isLoading} className="mt-6">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      )}

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Or continue with</span>
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <GoogleLoginButton
          onSuccess={(data) => {
            if (onSuccess) onSuccess(data?.user);
            handleClose();
          }}
          onError={(error) => setErrors({ form: error })}
        />
        {tab === 'signin' && <DemoLoginButton
          onSuccess={(user) => {
            if (onSuccess) onSuccess(user);
            handleClose();
          }}
          onError={(error) => setErrors({ form: error })}
        />}
      </div>
    </Modal>
  );
};

export default AuthModal;
