'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AuthPage } from '../_components/auth';
import { useForm } from 'react-hook-form';
import { RegisterAuth, registerSchema } from '@/types/schema/auth';
import { PasswordInput } from '@/components/ui/passwordInput';
import CreateUser from '../_components/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterAuth>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      password: '',
      whatsapp: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterAuth) => {
    setIsLoading(true);
    try {
      const result = await CreateUser({ credentials: data });
      console.log(data);
      if (result.success) {
        toast.success(result.message);
        router.push('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(' internal server error');
      console.error('Register failed:', error);
    } finally {
      reset();
      setIsLoading(false);
    }
  };

  return (
    <AuthPage>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Daftar ke Akun Anda</h1>
          <p className="text-muted-foreground mt-2">
            Masukkan kredensial Anda untuk membuat akun Anda
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="number"
              placeholder="Enter WhatsApp number"
              {...register('whatsapp')}
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-white hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register('password')}
              showStrengthMeter
              error={errors.password?.message}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Daftar'}
          </Button>
        </div>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthPage>
  );
}
