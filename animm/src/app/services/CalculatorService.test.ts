import useCalculatorService from './CalculatorService';

const { sum } = useCalculatorService();
test('SumTwoNumbers', () => {
  expect(sum(1, 2)).toBe(3);
});
