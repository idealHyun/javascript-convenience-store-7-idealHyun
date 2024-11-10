import { STORE_CONFIG } from '../constants/storeConfig.js';

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

  // 총 구매액 구하기
  getTotalPurchaseAmount() {
    return this.#getAppliedPromotionProductsAmount() + this.#getNotAppliedPromotionProductsAmount();
  }

  // 행사할인 금액 구하기
  getTotalPromotionDiscount() {
    return this.#bonusProducts.reduce((total, product) => total + product.product.getPrice(), 0);
  }

  // 멤버십 할인 금액 구하기
  getMembershipDiscountAmount() {
    const discountAmount = this.#getNotAppliedPromotionProductsAmount() * STORE_CONFIG.membershipDiscountRate;
    if (discountAmount > STORE_CONFIG.maximumMembershipDiscount){
      return STORE_CONFIG.maximumMembershipDiscount;
    }
    return discountAmount;
  }

  // 총 물건 개수 구하기
  getTotalQuantity(){
    return this.#getAppliedPromotionProductsQuantity() + this.#getNotAppliedPromotionProductsQuantity();
  }

  #getAppliedPromotionProductsQuantity(){
    return this.#appliedPromotionProducts.reduce((total, product) => total + product.product.getQuantity(), 0);
  }
  #getNotAppliedPromotionProductsQuantity(){
    return this.#notAppliedPromotionProducts.reduce((total, product) => total + product.product.getQuantity(), 0);
  }

  #getNotAppliedPromotionProductsAmount(){
    return this.#notAppliedPromotionProducts.reduce((total, product) => total + product.product.getPrice(), 0);
  }

  #getAppliedPromotionProductsAmount(){
    return this.#appliedPromotionProducts.reduce((total, product) => total + product.product.getPrice(), 0);
  }
}

export default Receipt;