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
import { Wallet, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // Toast notification is fired by the hook
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
        <div className="p-2.5 bg-gradient-to-tr from-brand-500 to-accent-emerald rounded-2xl shadow-[0_0_24px_rgba(16,185,129,0.35)] mb-4">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Create your account</h1>
        <p className="text-sm text-surface-500 mt-1">Free forever. No credit card required.</p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-2xl border border-surface-200/30 shadow-modal p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Ankit Singh"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Address"
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            error={errors.password?.message}
            helperText={!errors.password ? 'At least 6 characters' : undefined}
            {...register('password')}
          />

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting ? <UserPlus className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </motion.div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200/40" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-surface-500">Or sign up with</span>
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
            onError={() => toast.error('Google Sign Up Failed. Check your Client ID configuration.')}
            theme="filled_black"
            shape="rectangular"
            text="signup_with"
            size="large"
            width="340"
          />
        </div>

        {/* Log in link */}
        <p className="text-center mt-6 text-xs text-surface-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
