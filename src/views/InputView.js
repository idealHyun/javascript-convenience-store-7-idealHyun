import { Console } from '@woowacourse/mission-utils';
import { ERROR_MESSAGE, SYSTEM_MESSAGE } from '../constants/message.js';

class InputView {
  #FORMAT_REGEX = /^(\[[a-zA-Z가-힣]+-\d+\])(,(\[[a-zA-Z가-힣]+-\d+\]))*$/
  #YES = 'Y'
  #NO = 'N'

  async getInputProductAndQuantity(){
    const productAndQuantityInput =  await Console.readLineAsync(SYSTEM_MESSAGE.input.requestProductAndQuantity);
    this.#validateProductAndQuantity(productAndQuantityInput);

    return productAndQuantityInput
  }

  async getInputYesOrNo(){
    const answer = await Console.readLineAsync('');
    this.#validateAnswer(answer);

    return answer === this.#YES;
  }

  async getUseMembershipDiscount(){
    const answer = await Console.readLineAsync(SYSTEM_MESSAGE.input.requestMembershipDiscount);
    this.#validateAnswer(answer);

    return answer === this.#YES;
  }

  async getInputRepurchase(){
    const answer = await Console.readLineAsync(SYSTEM_MESSAGE.input.requestRepurchase);
    this.#validateAnswer(answer);

    return answer === this.#YES;
  }

  #validateAnswer(value){
    this.#checkBlank(value);
    this.#checkYOrN(value);
  }

  #checkYOrN(value){
    if(value !== this.#YES && value !== this.#NO){
     throw new Error(ERROR_MESSAGE.input.invalidInput)
    }
  }

  #validateProductAndQuantity(value){
    this.#checkBlank(value);
    this.#checkFormat(value);
  }

  #checkFormat(value){
    if (!this.#FORMAT_REGEX.test(value)) {
      throw new Error(ERROR_MESSAGE.input.invalidFormat);
    }
  }

  #checkBlank(value){
    if(value.trim() === ''){
      throw new Error(ERROR_MESSAGE.validation.blank);
    }
  }
}

export default InputView;
