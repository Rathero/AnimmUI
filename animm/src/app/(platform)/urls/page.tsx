'use client';
import { HeaderPage } from '@/components/header-page';
import { GeneratedAnimationsColumns } from './generatedAnimations-columns';
import { DataTable } from '@/components/table/data-table';
import { useEffect, useState } from 'react';
import useGeneratedAnimationService from '@/app/services/GeneratedAnimationsService';
import { GeneratedAnimation } from '@/types/generatedAnimations';

export default function UrlsPage() {
  const [generatedAnimations, setGeneratedAnimations] = useState<
    GeneratedAnimation[]
  >([]);

  const { getAll } = useGeneratedAnimationService();
  const fetch = async () => {
    const animations = await getAll();
    setGeneratedAnimations(animations?.Result ?? []);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage title="Urls" desc="You can find your generated Urls" />
      <div className="w-full p-4">
        {generatedAnimations && (
          <DataTable
            columns={GeneratedAnimationsColumns}
            data={generatedAnimations}
            showFilter={false}
          />
        )}
      </div>
    </div>
  );
}
