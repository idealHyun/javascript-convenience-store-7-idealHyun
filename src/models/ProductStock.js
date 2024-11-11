import { ERROR_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class ProductStock {
  #productName;
  #quantity;

  constructor(productName, quantity) {
    this.#validateProduct(productName);
    this.#validateQuantity(quantity);
    this.#productName = productName;
    this.#quantity = Number(quantity);
  }

  getQuantity() {
    return this.#quantity;
  }

  getProductName() {
    return this.#productName;
  }

  decrementQuantity(count) {
    this.#quantity -= count;
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
      throw new Error(ERROR_MESSAGE.validation.invalidNumber);
    }
  }

  #checkNullAndUndefined(value) {
    if (value === null || value === undefined) {
      throw new Error(ERROR_MESSAGE.validation.notProvided);
    }
  }

  #checkQuantityRange(value) {
    if (value < STORE_CONFIG.minimumProductQuantity) {
      throw new Error(ERROR_MESSAGE.validation.invalidQuantity);
    }
  }
}

export default ProductStock;
