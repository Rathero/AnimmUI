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
    setIsLoaded(true);
  }, [isLoaded]);

  if (isLoaded) return <>{children}</>;
  else
    return (
      <div className="items-center justify-center flex-col p-4  h-[800px]"></div>
    );
};

export default LoginChecker;
