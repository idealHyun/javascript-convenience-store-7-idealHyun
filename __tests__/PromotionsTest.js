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

  describe('추가 증정 테스트',()=>{
    test.each([
      {
        description: 'buy가 3, get이 1일 때 9개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산3+1',
          buy: '3',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 9,
        expectValue: 0
      },
      {
        description: 'buy가 3, get이 1일 때 10개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산3+1',
          buy: '3',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 10,
        expectValue: 0
      },
      {
        description: 'buy가 3, get이 1일 때 11개 구매(추가 증정 1개)',
        promotionInfo: {
          name: '탄산3+1',
          buy: '3',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 11,
        expectValue: 1
      },
      {
        description: 'buy가 4, get이 1일 때 8개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산4+1',
          buy: '4',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 8,
        expectValue: 0
      },
      {
        description: 'buy가 4, get이 1일 때 9개 구매(추가 증정 1개)',
        promotionInfo: {
          name: '탄산4+1',
          buy: '4',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 9,
        expectValue: 1
      },
      {
        description: 'buy가 2, get이 1일 때 5개 구매(추가 증정 1개)',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 5,
        expectValue: 1
      },
      {
        description: 'buy가 3, get이 1일 때 3개 구매(추가 증정 1개)',
        promotionInfo: {
          name: '탄산3+1',
          buy: '3',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 3,
        expectValue: 1
      },
      {
        description: 'buy가 3, get이 1일 때 2개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산3+1',
          buy: '3',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 2,
        expectValue: 0
      },
      {
        description: 'buy가 1, get이 1일 때 2개 구매(추가 증정 없음)',
        promotionInfo: {
          name: '탄산1+1',
          buy: '1',
          get: '1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        purchaseQuantity: 2,
        expectValue: 0
      }
    ])('$description', ({ promotionInfo,purchaseQuantity,expectValue }) => {
      const { name, buy, get, startDate, endDate } = promotionInfo;
      const promotion = new Promotion(name, buy, get, startDate, endDate);

      expect(promotion.calculateBonusQuantity(purchaseQuantity)).toBe(expectValue);
    })

  })
});
