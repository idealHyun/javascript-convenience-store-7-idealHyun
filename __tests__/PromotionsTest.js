describe('Promotion 테스트', () => {

  test('프로모션 생성자 테스트', () => {
    const promotionInfo = {
      name: '탄산2+1',
      buy: '2',
      get: '1',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    };

    expect(()=>{
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
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        }
      },
      {
        description: 'buy 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: null,
          get: '1',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        }
      },
      {
        description: 'get 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: null,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        }
      },
      {
        description: 'start_date 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: '1',
          start_date: null,
          end_date: '2024-12-31',
        }
      },
      {
        description: 'end_date 값이 null',
        promotionInfo: {
          name: '탄산2+1',
          buy: '2',
          get: '1',
          start_date: '2024-01-01',
          end_date: null,
        }
      },
    ])('$description', ({ promotionInfo }) => {
      expect(() => {
        new Promotion(promotionInfo);
      }).toThrow('[ERROR]');
    });
  });

});