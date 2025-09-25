'use client';

import { BrandImageRequest } from '@/types/brandImageRequest';

const useBrandService = () => {
  const addBrandImage = async (brandImageRequest: BrandImageRequest) => {
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/brand/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brandImageRequest),
    });
  };

  return { addBrandImage };
};

export default useBrandService;
