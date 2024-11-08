import PromotionProductStock from '../src/models/PromotionProductStock.js';

describe('PromotionProductStock 테스트', () => {
  test('생성자 테스트', () => {
    const productName = '콜라';
    const quantity = '10';
    const promotionName = '탄산2+1';

    expect(() => {
      new PromotionProductStock(productName, quantity, promotionName);
    }).not.toThrow();
  });

  test('프로모션 없는 생성자 테스트', () => {
    const productName = '콜라';
    const quantity = '10';
    const promotionName = null;

    expect(() => {
      new PromotionProductStock(productName, quantity, promotionName);
    }).toThrow('[ERROR]');
  });

  test('productName 없는 생성자 예외 테스트', () => {
    const productName = null;
    const quantity = '10';
    const promotionName = '탄산2+1';

    expect(() => {
      new PromotionProductStock(productName, quantity, promotionName);
    }).toThrow('[ERROR]');
  });

  test('quantity 없는 생성자 예외 테스트', () => {
    const productName = '콜라';
    const quantity = null;
    const promotionName = '탄산2+1';

    expect(() => {
      new PromotionProductStock(productName, quantity, promotionName);
    }).toThrow('[ERROR]');
  });
});
