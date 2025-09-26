import { HeaderPage } from '@/components/header-page';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push('/collections');
  }, []);
  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage title="Home" />
      <div className="w-full flex flex-wrap gap-4 p-4"></div>
    </div>
  );
}
