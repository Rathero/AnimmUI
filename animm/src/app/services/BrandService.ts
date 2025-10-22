import useFetchWithAuth from './fetchWithAuth';

const useBrandService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const addBrandImage = async (data: FormData) => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/brand/image',
      {
        method: 'POST',
        body: data,
      }
    );
  };
  const getBrandImages = async () => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/brand/images',
      {
        method: 'GET',
      }
    );
    return await response.json();
  };

  const deleteBrandImage = async (imageId: number) => {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/brand/${imageId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) throw new Error('Failed to delete image');
    return response.json();
  };

  const loadImages = async () => {
    const data = await getBrandImages()
    return Array.isArray(data.Result) ? data.Result : []
  }

  return { addBrandImage, getBrandImages, deleteBrandImage, loadImages };
};

export default useBrandService;