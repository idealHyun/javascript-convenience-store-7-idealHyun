import Product from '../src/models/Product.js';
import { ERROR_MESSAGE } from '../src/constants/message.js';
import { STORE_CONFIG } from '../src/constants/storeConfig.js';

describe('Product 생성자 테스트', () => {
  test('Product 생성자 정상 생성 테스트', () => {
    // given
    const name = '젤리';
    const price = '1500';

    // when
    const product = new Product(name, price);

    // then
    expect(product.getName()).toBe('젤리');
    expect(product.getPrice()).toBe(1500);
  });

  describe('Product 생성자 예외 테스트', () => {
    const testCases = [
      {
        description: '이름이 null인 경우 예외 발생',
        name: null,
        price: '1500',
        expectedError: ERROR_MESSAGE.validation.notProvided,
      },
      {
        description: '이름이 undefined인 경우 예외 발생',
        name: undefined,
        price: '1500',
        expectedError: ERROR_MESSAGE.validation.notProvided,
      },
      {
        description: '이름이 빈 문자열인 경우 예외 발생',
        name: '',
        price: '1500',
        expectedError: ERROR_MESSAGE.validation.invalidString,
      },
      {
        description: '이름이 공백 문자열인 경우 예외 발생',
        name: '   ',
        price: '1500',
        expectedError: ERROR_MESSAGE.validation.invalidString,
      },
      {
        description: '가격이 null 인 경우 예외 발생',
        name: '젤리',
        price: null,
        expectedError: ERROR_MESSAGE.validation.notProvided,
      },
      {
        description: '가격이 undefined 인 경우 예외 발생',
        name: '젤리',
        price: undefined,
        expectedError: ERROR_MESSAGE.validation.notProvided,
      },
      {
        description: '가격이 숫자가 아닌 문자열인 경우 예외 발생',
        name: '젤리',
        price: '가격',
        expectedError: ERROR_MESSAGE.validation.invalidNumber,
      },
      {
        description: '가격이 정수가 아닌 경우 예외 발생',
        name: '젤리',
        price: '1500.5',
        expectedError: ERROR_MESSAGE.validation.invalidInteger,
      },
      {
        description: '가격이 음수인 경우 예외 발생',
        name: '젤리',
        price: '-500',
        expectedError: ERROR_MESSAGE.validation.invalidPrice,
      },
      {
        description: '가격이 최소 가격 미만인 경우 예외 발생',
        name: '젤리',
        price: `${STORE_CONFIG.minimumPrice - 1}`,
        expectedError: ERROR_MESSAGE.validation.invalidPrice,
      },
    ];

    test.each(testCases)('$description', ({ name, price, expectedError }) => {
      expect(() => {
        new Product(name, price);
      }).toThrow(expectedError);
    });
  });
});
