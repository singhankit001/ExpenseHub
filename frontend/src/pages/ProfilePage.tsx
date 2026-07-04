import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate } from '@/utils';
import { User as UserIcon, Calendar, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
});

type ProfileFields = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFields) => {
    setIsUpdating(true);
    try {
      const res = await authService.updateProfile(data);
      if (res.data.success) {
        updateUser(res.data.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">User Profile</h1>
        <p className="text-sm text-surface-600">Manage your personal settings and profile credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column */}
        <Card className="lg:col-span-1 border border-surface-200">
          <CardContent className="flex flex-col items-center text-center gap-4 pt-6">
            <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 font-extrabold flex items-center justify-center text-2xl border border-brand-100 shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">{user?.name}</h2>
              <p className="text-xs text-surface-500">{user?.email}</p>
            </div>
            
            <div className="w-full border-t border-surface-100 pt-4 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-2.5 text-xs text-surface-700">
                <UserIcon className="w-4 h-4 text-surface-500" />
                <span>ID: {user?.id}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-surface-700">
                <Mail className="w-4 h-4 text-surface-500" />
                <span>Email: {user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-surface-700">
                <Calendar className="w-4 h-4 text-surface-500" />
                <span>Joined: {user?.createdAt ? formatDate(user.createdAt, 'd MMMM yyyy') : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Form Column */}
        <Card className="lg:col-span-2 border border-surface-200">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your name and primary email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  id="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" variant="primary" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
