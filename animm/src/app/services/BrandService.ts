import { add } from '@tensorflow/tfjs';
import useFetchWithAuth from './fetchWithAuth';

const useBrandService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const addBrandAssets = async (data: FormData) => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/BrandAsset/asset',
      {
        method: 'POST',
        body: data,
      }
    );
  };
  const getBrandAssets = async () => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/BrandAsset/assets',
      {
        method: 'GET',
      }
    );
    return await response.json();
  };

  const deleteBrandAsset = async (assetId: number) => {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/BrandAsset/assets/${assetId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) throw new Error('Failed to delete image');
    return response.json();
  };

  const loadAssets = async () => {
    const data = await getBrandAssets()
    return Array.isArray(data.Result) ? data.Result : []
  }

  const addBrandColors = async (data: FormData) => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/BrandAsset/color',
      {
        method: 'POST',
        body: data,
      }
    );
    if (!response.ok) throw new Error('Failed to add color');
    return response.json();
  };

  const getBrandColors = async () => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/BrandAsset/colors',
      {
        method: 'GET',
      }
    );
    return await response.json();
  };

  const deleteBrandColor = async (colorId: number) => {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/BrandAsset/colors/${colorId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) throw new Error('Failed to delete color');
    return response.json();
  };

  const loadColors = async () => {
    const data = await getBrandColors()
    return Array.isArray(data.Result) ? data.Result : []
  }

  return { addBrandAssets, getBrandAssets, deleteBrandAsset, loadAssets, addBrandColors, getBrandColors, loadColors, deleteBrandColor };
};

export default useBrandService;