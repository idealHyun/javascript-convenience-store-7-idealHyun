class ReceiptDTO {
  constructor(purchasedProducts, promotionProducts, totalInfo) {
    this.purchasedProducts = purchasedProducts;
    this.promotionProducts = promotionProducts;
    this.totalInfo = totalInfo;
  }

  getPurchasedProducts() {
    return this.purchasedProducts;
  }

  getPromotionProducts() {
    return this.promotionProducts;
  }

  getTotalInfo() {
    return this.totalInfo;
  }
}

export default ReceiptDTO;
