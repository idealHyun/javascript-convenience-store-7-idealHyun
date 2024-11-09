import { Console } from '@woowacourse/mission-utils';
import { EXCEED_QUANTITY_MESSAGE, SYSTEM_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class OutputView {
  printWelcomeMessage() {
    Console.print(SYSTEM_MESSAGE.OUTPUT.WELCOME);
  }

  printProductInfo(productInfoDTO) {
    this.#printPromotionProductInfo(productInfoDTO.getProductName(), productInfoDTO.getPrice(),
      productInfoDTO.getPromotionProductQuantity(), productInfoDTO.getPromotionName());
    this.#printProductInfo(productInfoDTO.getProductName(), productInfoDTO.getPrice(),
      productInfoDTO.getProductQuantity());
  }

  printExceedPromotionProductInfo(productPromotionInfoDTO){
    Console.print(EXCEED_QUANTITY_MESSAGE(productPromotionInfoDTO.getProductName(),productPromotionInfoDTO.getProductQuantity()));
  }

  #printPromotionProductInfo(productName,price,quantity,promotionName) {
    if (quantity < STORE_CONFIG.MINIMUM_PRODUCT_QUANTITY || quantity === null ) {
      return ;
    }
    Console.print(`- ${productName} ${price.toLocaleString()}원 ${quantity}개 ${promotionName}`);
  }

  #printProductInfo(productName,price,quantity) {
    if (quantity < STORE_CONFIG.MINIMUM_PRODUCT_QUANTITY || quantity === null ) {
      Console.print(`- ${productName} ${price.toLocaleString()}원 재고 없음`);
      return ;
    }
    Console.print(`- ${productName} ${price.toLocaleString()}원 ${quantity}개`);
  }
}

export default OutputView;
