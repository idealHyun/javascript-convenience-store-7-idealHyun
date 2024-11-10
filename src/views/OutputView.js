import { Console } from '@woowacourse/mission-utils';
import { SYSTEM_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class OutputView {
  printMessage(message) {
    Console.print(message);
  }

  printWelcomeMessage() {
    Console.print(SYSTEM_MESSAGE.output.welcome);
  }

  printProductInfo(productInfoDTO) {
    this.#printPromotionProductInfo(productInfoDTO.getProductName(), productInfoDTO.getPrice(),
      productInfoDTO.getPromotionProductQuantity(), productInfoDTO.getPromotionName());
    this.#printProductInfo(productInfoDTO.getProductName(), productInfoDTO.getPrice(),
      productInfoDTO.getProductQuantity());
  }

  printExceedPromotionProductInfo(productPromotionInfoDTO){
    Console.print(SYSTEM_MESSAGE.output.promotionExceedQuantity(productPromotionInfoDTO.getProductName(),productPromotionInfoDTO.getProductQuantity()));
  }

  printGuidePromotionProductInfo(productPromotionInfoDTO){
    if(productPromotionInfoDTO.getProductQuantity()>0){
      Console.print(SYSTEM_MESSAGE.output.promotionGuide(productPromotionInfoDTO.getProductName(),productPromotionInfoDTO.getProductQuantity()));
    }
  }

  #printPromotionProductInfo(productName,price,quantity,promotionName) {
    if (quantity < STORE_CONFIG.minimumProductQuantity || quantity === null ) {
      return ;
    }
    Console.print(`- ${productName} ${price.toLocaleString()}원 ${quantity}개 ${promotionName}`);
  }

  #printProductInfo(productName,price,quantity) {
    if (quantity < STORE_CONFIG.minimumProductQuantity || quantity === null ) {
      Console.print(`- ${productName} ${price.toLocaleString()}원 재고 없음`);
      return ;
    }
    Console.print(`- ${productName} ${price.toLocaleString()}원 ${quantity}개`);
  }
}

export default OutputView;
