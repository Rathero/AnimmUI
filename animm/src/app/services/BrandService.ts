const useBrandService = () => {
  const addBrandImage = async (data: FormData) => {
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/brand/image', {
      method: 'POST',
      body: data,
    });
  };

  return { addBrandImage };
};

export default useBrandService;
