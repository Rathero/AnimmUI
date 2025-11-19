import useCalculatorService from './CalculatorService';

const { sum } = useCalculatorService();
test('GivenTwoNumbers_WhenSum_ThenResultIsOk', () => {
  expect(sum(1, 2)).toBe(3);
});

test('GivenTwoNumbersNegative_WhenSum_ThenResultIsOk', () => {
  expect(sum(-1, -2)).toBe(-3);
});
