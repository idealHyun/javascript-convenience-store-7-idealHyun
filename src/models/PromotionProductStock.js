import ProductStock from './ProductStock.js';
import { ERROR_MESSAGE } from '../constants/message.js';

class PromotionProductStock extends ProductStock{
  #promotionName

  constructor(productName, quantity, promotionName) {
    super(productName, quantity);
    this.#validatePromotionName(promotionName)
    this.#promotionName = promotionName
  }

  #validatePromotionName(promotionName){
    this.#checkNullAndUndefined(promotionName);
  }

  #checkNullAndUndefined(value) {
    if (value === null || value === undefined) {
      throw new Error(ERROR_MESSAGE.VALIDATION.NOT_PROVIDED);
    }
  }
}

export default PromotionProductStock;