const useCalculatorService = () => {
  const sum = (a: number, b: number) => {
    return a + b;
  };

  return {
    sum,
  };
};

export default useCalculatorService;
