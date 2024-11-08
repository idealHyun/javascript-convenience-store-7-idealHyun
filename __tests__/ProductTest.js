import Product from '../src/models/Product.js';

describe('Product 테스트', () => {
  test('Product 생성자 테스트', () => {
    // given
    const name = '젤리';
    const price = '1500';

    // when
    const product = new Product(name, price);

    // then
    expect(product.getName())
      .toBe('젤리');
    expect(product.getPrice())
      .toBe(1500);
  });

  test('Product 이름 없는 예외 테스트', () => {
    const name = null;
    const price = '1500';

    expect(() => {
      new Product(name, price);
    })
      .toThrow('[ERROR]');
  });

  test('Product 가격 없는 예외 테스트', () => {
    const name = '젤리';
    const price = null;

    expect(() => {
      new Product(name, price);
    })
      .toThrow('[ERROR]');
  });
});