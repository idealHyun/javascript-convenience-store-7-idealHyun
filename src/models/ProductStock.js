import { ERROR_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class ProductStock {
  #productName;
  #quantity;

  constructor(productName, quantity) {
    this.#validateProduct(productName);
    this.#validateQuantity(quantity);
    this.#productName = productName;
    this.#quantity = quantity;
  }

  #validateProduct(product) {
    this.#checkNullAndUndefined(product);
  }

  #validateQuantity(quantity) {
    this.#checkNullAndUndefined(quantity);
    this.#checkTypeNumber(quantity);

    const numberQuantity = Number(quantity);
    this.#checkQuantityRange(numberQuantity);
  }

  #checkTypeNumber(value) {
    if (isNaN(Number(value))) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_NUMBER);
    }
  }

  #checkNullAndUndefined(value) {
    if (value === null || value === undefined) {
      throw new Error(ERROR_MESSAGE.VALIDATION.NOT_PROVIDED);
    }
  }

  #checkQuantityRange(value) {
    if (value < STORE_CONFIG.MINIMUM_PRODUCT_QUANTITY) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_QUANTITY);
    }
  }
}

export default ProductStock;
