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

  calculateMaxPromotionQuantity(purchaseQuantity, promotionProductCount) {
    const promotionSetProductCount = this.#buy + this.#get;
    let totalPromotionQuantity = 0;
    let remainingPurchaseQuantity = purchaseQuantity;

    while (remainingPurchaseQuantity >= this.#buy &&
    totalPromotionQuantity + promotionSetProductCount <= promotionProductCount) {

      totalPromotionQuantity += promotionSetProductCount;
      remainingPurchaseQuantity -= this.#buy;

      if (remainingPurchaseQuantity < this.#buy) {
        break;
      }
    }

    return totalPromotionQuantity;
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
      throw new Error(ERROR_MESSAGE.validation.notProvided);
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

  #checkTypeDate(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(ERROR_MESSAGE.validation.invalidDate);
    }
  }

  #checkBuyNumberRange(value) {
    if (value < STORE_CONFIG.minimumBuyQuantity) {
      throw new Error(ERROR_MESSAGE.validation.invalidBuyRange);
    }
  }

  #checkGetNumberRange(value) {
    if (value < STORE_CONFIG.getQuantity) {
      throw new Error(ERROR_MESSAGE.validation.invalidGetRange);
    }
  }

  #checkString(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(ERROR_MESSAGE.validation.invalidString);
    }
  }

  #checkPeriod(startDate, endDate) {
    if (endDate < startDate) {
      throw new Error(ERROR_MESSAGE.validation.invalidPeriod);
    }
  }
}

export default Promotion;
