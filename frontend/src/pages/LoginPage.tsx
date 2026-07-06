import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setIsSubmitting(true);
    try {
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // toast fired inside useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-2.5 bg-gradient-to-tr from-brand-500 to-accent-violet rounded-2xl shadow-[0_0_24px_rgba(99,102,241,0.4)] mb-4">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-surface-500 mt-1">Sign in to your ExpenseFlow account</p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-2xl border border-surface-200/30 shadow-modal p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Email Address"
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <Input
              label="Password"
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end">
              <span className="text-[11px] text-surface-500 hover:text-brand-400 cursor-pointer transition-colors">
                Forgot password?
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting ? <LogIn className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </motion.div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200/40" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-surface-500 bg-transparent">Or continue with</span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  await loginWithGoogle(credentialResponse.credential);
                  navigate('/dashboard', { replace: true });
                } catch {
                  // Error handled in useAuth
                }
              }
            }}
            onError={() => toast.error('Google Login Failed. Check your Client ID configuration.')}
            theme="filled_black"
            shape="rectangular"
            text="continue_with"
            size="large"
            width="340"
          />
        </div>

        {/* Sign up link */}
        <p className="text-center mt-6 text-xs text-surface-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
          >
            Create one free
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
