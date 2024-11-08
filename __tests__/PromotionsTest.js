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
      new Promotion(promotionInfo);
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
});
