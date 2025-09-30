'use client';
import { platformStore } from '@/stores/platformStore';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useBrandService from '@/app/services/BrandService';

export function BrandImageUploader({ buttonText }: { buttonText: string }) {
  const { setPageTitle } = platformStore(state => state);
  const [userId, setUserId] = useState('0');
  const [file, setFile] = useState<File | undefined>(undefined);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const { addBrandImage: addBrandImage } = useBrandService();
  // Set page title
  useEffect(() => {
    setPageTitle('Brand Assets');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

  const upload = async () => {
    const data = new FormData();
    data.append('UserId', userId);
    data.append('File', file!);
    addBrandImage(data);
  };

  const imageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFile(file);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">UserId</Label>
        <Input
          id="name"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
      </div>

      <div
        className="bg-background/25 transition-opacity opacity-100 z-50 cursor-pointer"
        onClick={() => {
          if (hiddenFileInput.current != null) hiddenFileInput.current.click();
        }}
      >
        <input
          ref={hiddenFileInput}
          type="file"
          onChange={e => {
            imageUploaded(e);
          }}
          style={{ display: 'none' }}
        ></input>
        <Button variant={'secondary'} className="text-xs p-3 h-8 rounded-lg">
          Select Image
        </Button>
      </div>

      <Button
        variant={'secondary'}
        className="text-xs p-3 h-8 rounded-lg"
        onClick={upload}
      >
        {buttonText}
      </Button>
    </>
  );
}
