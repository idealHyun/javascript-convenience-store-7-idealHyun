import { ERROR_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class Product {
  #name;
  #price;

  constructor(name, price) {
    this.#validateName(name);
    this.#validatePrice(price);
    this.#name = name;
    this.#price = Number(price);
  }

  getName() {
    return this.#name;
  }

  getPrice() {
    return this.#price;
  }

  #validateName(name) {
    this.#checkNullAndUndefined(name);
    this.#checkString(name);
  }

  #validatePrice(price) {
    this.#checkNullAndUndefined(price);
    this.#checkTypeNumber(price);

    const numberPrice = Number(price);
    this.#checkTypeInteger(numberPrice);
    this.#checkPriceRange(numberPrice);
  }

  #checkNullAndUndefined(value) {
    if (value === null || value === undefined) {
      throw new Error(ERROR_MESSAGE.VALIDATION.NOT_PROVIDED);
    }
  }

  #checkString(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_STRING);
    }
  }

  #checkTypeNumber(value) {
    if (isNaN(Number(value))) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_NUMBER);
    }
  }

  #checkTypeInteger(value) {
    if (!Number.isInteger(value)) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_INTEGER);
    }
  }

  #checkPriceRange(value) {
    if (Number(value) < STORE_CONFIG.MINIMUM_PRICE) {
      throw new Error(ERROR_MESSAGE.VALIDATION.MINIMUM_PRICE);
    }
  }
}

export default Product;
