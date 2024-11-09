import { ERROR_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class Promotion {
  #name;
  #buy;
  #get;
  #startDate;
  #endDate;

  constructor(name, buy, get, startDate, endDate) {
    this.#validateFields(name, buy, get, startDate, endDate);
    this.#name = name;
    this.#buy = Number(buy);
    this.#get = Number(get);
    this.#startDate = startDate;
    this.#endDate = endDate;
  }

  isOngoingPromotion(dayTime){
    return dayTime >= new Date(this.#startDate) && dayTime <= new Date(this.#endDate);
  }

  calculateBonusQuantity(purchaseQuantity){
    if(purchaseQuantity % (this.#buy + this.#get) >= this.#buy){
      return this.#get;
    }
    return 0;
  }

  #validateFields(name, buy, get, startDate, endDate) {
    this.#validateName(name);
    this.#validateBuy(buy);
    this.#validateGet(get);
    this.#validateStartDate(startDate);
    this.#validateEndDate(startDate, endDate);
  }

  #validateName(name) {
    this.#checkNullAndUndefined(name);
    this.#checkString(name);
  }

  #validateBuy(buy) {
    this.#checkNullAndUndefined(buy);
    this.#checkTypeNumber(buy);
    const numberBuy = Number(buy);

    this.#checkTypeInteger(numberBuy);
    this.#checkBuyNumberRange(numberBuy);
  }

  #validateGet(get) {
    this.#checkNullAndUndefined(get);
    this.#checkTypeNumber(get);
    const numberGet = Number(get);

    this.#checkTypeInteger(numberGet);
    this.#checkGetNumberRange(numberGet);
  }

  #validateStartDate(startDate) {
    this.#checkNullAndUndefined(startDate);
    this.#checkTypeDate(startDate);
  }

  #validateEndDate(startDate, endDate) {
    this.#checkNullAndUndefined(endDate);
    this.#checkTypeDate(endDate);
    this.#checkPeriod(new Date(startDate), new Date(endDate));
  }

  #checkNullAndUndefined(value) {
    if (value === null || value === undefined) {
      throw new Error(ERROR_MESSAGE.VALIDATION.NOT_PROVIDED);
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

  #checkTypeDate(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_DATE);
    }
  }

  #checkBuyNumberRange(value) {
    if (value < STORE_CONFIG.MINIMUM_BUY_QUANTITY) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_BUY_RANGE);
    }
  }

  #checkGetNumberRange(value) {
    if (value < STORE_CONFIG.MINIMUM_GET_QUANTITY) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_GET_RANGE);
    }
  }

  #checkString(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_STRING);
    }
  }

  #checkPeriod(startDate, endDate) {
    if (endDate < startDate) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_PERIOD);
    }
  }
}

export default Promotion;
