import Promotion from '../src/models/Promotion.js';

describe('Promotion 테스트', () => {
  test('프로모션 생성자 테스트', () => {
    const promotionInfo = {
      name: '탄산2+1',
      buy: '2',
      get: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    expect(() => {
      const { name, buy, get, startDate, endDate } = promotionInfo;
      new Promotion(name, buy, get, startDate, endDate);
    }).not.toThrow();
  });

  describe('프로모션 생성 예외 테스트', () => {
    test.each([
      {
        description: 'name 값이 null',
        promotionInfo: {
          name: null,
          buy: '2',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
      {
        description: 'buy 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: null,
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
      {
        description: 'get 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: null,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      },
      {
        description: 'startDate 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: '1',
          startDate: null,
          endDate: '2024-12-31',
        },
      },
      {
        description: 'endDate 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: '1',
          startDate: '2024-01-01',
          endDate: null,
        },
      },
    ])('$description', ({ promotionInfo }) => {
      expect(() => {
        new Promotion(promotionInfo);
      }).toThrow('[ERROR]');
    });
  });

  describe('프로모션 적용 가능한 최대 개수를 계산하는 메소드 기능 테스트', () => {
    test.each([
      {
        description: 'buy가 2, get이 1일 때 12개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 10,
        purchaseQuantity: 12,
        expectValue: 9,
      },
      {
        description: 'buy가 2, get이 1일 때 1개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 10,
        purchaseQuantity: 1,
        expectValue: 0,
      },
      {
        description: 'buy가 2, get이 1일 때 2개 구매(혜택 1개)',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 10,
        purchaseQuantity: 2,
        expectValue: 3,
      },
      {
        description: 'buy가 2, get이 1일 때 5개 구매(혜택 1개)',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 10,
        purchaseQuantity: 5,
        expectValue: 6,
      },
      {
        description: 'buy가 2, get이 1일 때 9개 구매',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 10,
        purchaseQuantity: 9,
        expectValue: 9,
      },
      {
        description: 'buy가 2, get이 1일 때 9개 구매',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 7,
        purchaseQuantity: 9,
        expectValue: 6,
      },
      {
        description: 'buy가 2, get이 1일 때 2개 구매',
        promotionInfo: {
          name: '탄산3+1',
          buy: 2,
          get: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        promotionProductCount: 2,
        purchaseQuantity: 2,
        expectValue: 0,
      },
    ])(
      '$description',
      ({
        promotionInfo,
        promotionProductCount,
        purchaseQuantity,
        expectValue,
      }) => {
        const { name, buy, get, startDate, endDate } = promotionInfo;
        const promotion = new Promotion(name, buy, get, startDate, endDate);

        expect(
          promotion.calculateMaxPromotionQuantity(
            purchaseQuantity,
            promotionProductCount,
            promotion.calculatePromotionSetSize(),
          ),
        ).toBe(expectValue);
      },
    );
  });
});
