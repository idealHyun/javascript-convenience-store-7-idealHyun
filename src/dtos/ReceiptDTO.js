class ReceiptDTO {
  constructor(purchasedProducts,bonusProducts, totalInfo) {
    this.purchasedProducts = purchasedProducts;
    this.bonusProducts = bonusProducts;
    this.totalInfo = totalInfo;
  }

  getPurchasedProducts() {
    return this.purchasedProducts;
  }

  getBonusProducts() {
    return this.bonusProducts;
  }

  getTotalInfo() {
    return this.totalInfo;
  }
}

export default ReceiptDTO;
