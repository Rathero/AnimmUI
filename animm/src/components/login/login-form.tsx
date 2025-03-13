'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginService } from '@/app/services/LoginService';
import Logo from './../../../public/img/LogoBlack.svg';
import { platformStore } from '@/stores/platformStore';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const { setAuthenticationResponse } = platformStore(state => state);
  async function login() {
    setError('');
    try {
      const response = await loginService.login(email, password);
      if (response?.Result) {
        setAuthenticationResponse(response.Result);
        router.push('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex items-center justify-center rounded-md">
              <Image priority src={Logo} alt="Animm Logo" width={50} />
            </div>
            <span className="sr-only">Animm</span>
          </a>
          <h1 className="text-xl font-bold">Welcome to Animm.</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Login to your account
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" onClick={login}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
