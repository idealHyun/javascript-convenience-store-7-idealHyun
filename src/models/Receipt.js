class Receipt {
  #appliedPromotionProducts
  #notAppliedPromotionProducts
  #bonusProducts

  constructor() {
    this.#appliedPromotionProducts = []
    this.#notAppliedPromotionProducts = []
    this.#bonusProducts = []
  }

  addAppliedPromotionProduct(purchasedProductAndQuantity) {
    this.#appliedPromotionProducts.push(purchasedProductAndQuantity);
  }

  addNotAppliedPromotionProduct(purchasedProductAndQuantity) {
    this.#notAppliedPromotionProducts.push(purchasedProductAndQuantity);
  }

  addBonusProduct(bonusProductAndQuantity) {
    this.#bonusProducts.push(bonusProductAndQuantity);
  }
}

export default Receipt;