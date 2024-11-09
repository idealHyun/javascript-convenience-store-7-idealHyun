class ProductPromotionInfoDTO {
  #productName;
  #productQuantity;

  constructor(productName,productQuantity) {
    this.#productName = productName;
    this.#productQuantity = productQuantity;
  }

  static of(productName,productQuantity) {
    return new ProductPromotionInfoDTO(productName,productQuantity);
  }

  getProductName() {
    return this.#productName;
  }

  getProductQuantity() {
    return this.#productQuantity;
  }
}

export default ProductPromotionInfoDTO;