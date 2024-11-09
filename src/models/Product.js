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
      throw new Error(ERROR_MESSAGE.validation.notProvided);
    }
  }

  #checkString(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(ERROR_MESSAGE.validation.invalidString);
    }
  }

  #checkTypeNumber(value) {
    if (isNaN(Number(value))) {
      throw new Error(ERROR_MESSAGE.validation.invalidNumber);
    }
  }

  #checkTypeInteger(value) {
    if (!Number.isInteger(value)) {
      throw new Error(ERROR_MESSAGE.validation.invalidInteger);
    }
  }

  #checkPriceRange(value) {
    if (Number(value) < STORE_CONFIG.minimumPrice) {
      throw new Error(ERROR_MESSAGE.validation.MINIMUM_PRICE);
    }
  }
}

export default Product;
