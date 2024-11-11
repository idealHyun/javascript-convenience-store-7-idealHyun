class ProductDTO {
  #productName;
  #price;
  #productQuantity;
  #promotionProductQuantity;
  #promotionName;

  constructor(productName, price, productQuantity, promotionProductQuantity, promotionName) {
    this.#productName = productName;
    this.#price = price;
    this.#productQuantity = productQuantity;
    this.#promotionProductQuantity = promotionProductQuantity;
    this.#promotionName = promotionName;
  }

  static of(productInfo) {
    return new ProductDTO(
      productInfo.productName,
      productInfo.price,
      productInfo.productQuantity,
      productInfo.promotionProductQuantity,
      productInfo.promotionName,
    );
  }

  getProductName() {
    return this.#productName;
  }

  getPrice() {
    return this.#price;
  }

  getProductQuantity() {
    return this.#productQuantity;
  }

  getPromotionProductQuantity() {
    return this.#promotionProductQuantity;
  }

  getPromotionName() {
    return this.#promotionName;
  }
}

export default ProductDTO;