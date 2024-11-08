describe('Parser 테스트', () => {
  test('파싱',()=>{
    const parsedData = Parser.parsePromotions(promotionData);

    expect(parsedData).toEqual({
      '탄산2+1': { name: '탄산2+1', buy: 2, get: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
      'MD추천상품': { name: 'MD추천상품', buy: 1, get: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
      '반짝할인': { name: '반짝할인', buy: 1, get: 1, startDate: '2024-11-01', endDate: '2024-11-30' }
    })
  })
})