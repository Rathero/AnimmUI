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

  return { addBrandImage, getBrandImages };
};

export default useBrandService;