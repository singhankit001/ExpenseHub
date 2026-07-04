import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
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
    } catch (error) {
      // Toast notification is fired by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-surface-200">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-surface-900">Create an Account</CardTitle>
        <CardDescription>Enter details below to start tracking your finances</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            id="name"
            placeholder="Ankit Singh"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password (min 6 characters)"
            id="password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
            Sign Up
          </Button>
        </form>
        <div className="text-center mt-5 text-xs text-surface-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Log In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
