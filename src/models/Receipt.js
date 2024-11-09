class Receipt {
  #appliedPromotionProducts
  #notAppliedPromotionProducts
  #bonusProducts

  constructor() {
    this.#appliedPromotionProducts = []
    this.#notAppliedPromotionProducts = []
    this.#bonusProducts = []
  }

  addAppliedPromotionProduct(purchasedProductStock) {
    this.#appliedPromotionProducts.push(purchasedProductStock);
  }

  addNotAppliedPromotionProduct(purchasedProductStock) {
    this.#notAppliedPromotionProducts.push(purchasedProductStock);
  }

  addBonusProduct(bonusProductStock) {
    this.#bonusProducts.push(bonusProductStock);
  }
}

export default Receipt;