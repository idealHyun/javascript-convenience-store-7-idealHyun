import ConvenienceStore from '../src/models/ConvenienceStore.js';

describe("ConvenienceStore 재고 감소 테스트", () => {
  let convenienceStore;

  beforeEach(async () => {
    // given
    convenienceStore = new ConvenienceStore();
    await convenienceStore.loadInitData();
  });

  test.each([
    {
      description: '프로모션 재고만 감소',
      isExceed: false,
      productName: '콜라',
      decrementQuantity: 5,
      expectedProductQuantity: 10,
      expectedPromotionProductQuantity: 5
    },
    {
      description: '프로모션 재고를 초과하여 일반 재고 감소',
      isExceed: true,
      productName: '콜라',
      decrementQuantity: 12,
      expectedProductQuantity: 8,
      expectedPromotionProductQuantity: 0
    }
  ])(
    "$description",
    async ({ isExceed, productName, decrementQuantity, expectedProductQuantity, expectedPromotionProductQuantity }) => {
      // when
      convenienceStore.decrementPromotionProductQuantity(isExceed, productName, decrementQuantity);

      // then
      const updatedProductInfo = convenienceStore.getProductInfo(productName);
      const updatedProductQuantity = updatedProductInfo.productQuantity;
      const updatedPromotionProductQuantity = updatedProductInfo.promotionProductQuantity;

      expect(updatedProductQuantity).toBe(expectedProductQuantity);
      expect(updatedPromotionProductQuantity).toBe(expectedPromotionProductQuantity);
    }
  );

  test('일반 재고 감소 테스트',()=>{
    const productName = '정식도시락';
    const decrementQuantity = 2;

    convenienceStore.decrementProductQuantity(productName, decrementQuantity);

    const updatedProductInfo = convenienceStore.getProductInfo(productName);
    const updatedProductQuantity = updatedProductInfo.productQuantity;

    expect(updatedProductQuantity).toBe(6);
  })
});