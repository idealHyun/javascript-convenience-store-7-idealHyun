class ProductPromotionDTO {
  #productName;
  #productQuantity;

  constructor(productName,productQuantity) {
    this.#productName = productName;
    this.#productQuantity = productQuantity;
  }

  static of(productName,productQuantity) {
    return new ProductPromotionDTO(productName,productQuantity);
  }

  getProductName() {
    return this.#productName;
  }

  getProductQuantity() {
    return this.#productQuantity;
  }
}

export default ProductPromotionDTO;