describe('ProductStock 테스트', ()=>{
  test('생성자 테스트',()=>{
    const productName = '콜라'
    const quantity = '10';

    expect(()=>{new ProductStock(productName,quantity)}).not.toThrow();
  })

  test('productName 없는 생성자 예외 테스트',()=>{
    const productName = null
    const quantity = '10';

    expect(()=>{new ProductStock(productName,quantity)}).toThrow('[ERROR]');
  })

  test('quantity 없는 생성자 예외 테스트',()=>{
    const productName = '콜라'
    const quantity = null

    expect(()=>{new ProductStock(productName,quantity)}).toThrow('[ERROR]');
  })

  test('quantity 가 0으로 예외 발생',()=>{
    const productName = '콜라'
    const quantity = 0

    expect(()=>{new ProductStock(productName,quantity)}).toThrow('[ERROR]');
  })

  test('quantity 가 음수로 예외 발생',()=>{
    const productName = '콜라'
    const quantity = -4

    expect(()=>{new ProductStock(productName,quantity)}).toThrow('[ERROR]');
  })
})