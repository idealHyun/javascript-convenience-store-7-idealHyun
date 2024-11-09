import { Console } from '@woowacourse/mission-utils';
import { ERROR_MESSAGE, SYSTEM_MESSAGE } from '../constants/message.js';

class InputView {
  #FORMAT_REGEX = /^(\[[a-zA-Z가-힣]+-\d+\])(,(\[[a-zA-Z가-힣]+-\d+\]))*$/

  async getInputProductAndQuantity(){
    const productAndQuantityInput =  await Console.readLineAsync(SYSTEM_MESSAGE.INPUT.REQUEST_PRODUCT_AND_QUANTITY);
    this.#validateProductAndQuantity(productAndQuantityInput);

    return productAndQuantityInput
  }

  #validateProductAndQuantity(value){
    this.#checkBlank(value);
    this.#checkFormat(value);
  }

  #checkFormat(value){
    if (!this.#FORMAT_REGEX.test(value)) {
      throw new Error(ERROR_MESSAGE.INPUT.INVALID_FORMAT);
    }
  }

  #checkBlank(value){
    if(value.trim() === ''){
      throw new Error(ERROR_MESSAGE.VALIDATION.BLANK);
    }
  }
}

export default InputView;
