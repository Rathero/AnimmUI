'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToken } from '@/lib/token';

interface LoginCheckerProps {
  children: ReactNode;
  isLoginPage?: boolean;
}

const LoginChecker: React.FC<LoginCheckerProps> = ({
  children,
  isLoginPage = false,
}) => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const { isValidToken } = useToken();

  useEffect(() => {
    // Set loaded first to prevent infinite loops
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (!isValidToken()) {
        if (!isLoginPage) {
          router.push('/login');
          return;
        }
      } else {
        if (isLoginPage) {
          router.push('/collections');
          return;
        }
      }
    }
  }, [isLoaded, isValidToken, isLoginPage, router]);

  if (!isLoaded) {
    return (
      <div className="items-center justify-center flex-col p-4 h-[800px]">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoginChecker;
