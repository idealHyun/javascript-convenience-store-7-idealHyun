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
    Console.print(SYSTEM_MESSAGE.output.promotionGuide(productPromotionInfoDTO.getProductName(),productPromotionInfoDTO.getProductQuantity()));
  }

  printReceipt(receiptDTO){
    Console.print(SYSTEM_MESSAGE.output.initialReceipt);
    Console.print(SYSTEM_MESSAGE.output.purchasedProductsLine);
    this.#printPurchasedProducts(receiptDTO.getPurchasedProducts());
    Console.print(SYSTEM_MESSAGE.output.bonusLine);
    this.#printBonusProducts(receiptDTO.getBonusProducts());
    Console.print(SYSTEM_MESSAGE.output.line);
    this.#printTotalInfo(receiptDTO.getTotalInfo());
  }

  #printPurchasedProducts(purchasedProductDTOs) {
    purchasedProductDTOs.forEach((purchasedProductDTO) => {
      Console.print(
        `${purchasedProductDTO.getName()}\t\t\t${purchasedProductDTO.getQuantity()}\t${purchasedProductDTO.getAmount().toLocaleString()}`
      );
    });
  }

  #printBonusProducts(bonusProductDTOs) {
    bonusProductDTOs.forEach((bonusProductDTO) => {
      Console.print(`${bonusProductDTO.getName()}\t\t\t${bonusProductDTO.getQuantity()}`);
    });
  }

  #printTotalInfo(totalInfoDTO) {
    Console.print(`총구매액\t\t${totalInfoDTO.getTotalQuantity()}\t${totalInfoDTO.getTotalAmount().toLocaleString()}`);
    Console.print(`행사할인\t\t\t-${totalInfoDTO.getPromotionDiscount().toLocaleString()}`);
    Console.print(`멤버십할인\t\t\t-${totalInfoDTO.getMembershipDiscount().toLocaleString()}`);
    Console.print(`내실돈\t\t\t\t${totalInfoDTO.getFinalAmount().toLocaleString()}`);
  }

  #printPromotionProductInfo(productName,price,quantity,promotionName) {
    if (quantity === null ) {
      return ;
    }
    if (quantity === 0 ) {
      Console.print(`- ${productName} ${price.toLocaleString()}원 재고 없음 ${promotionName}`);
    } else{
      Console.print(`- ${productName} ${price.toLocaleString()}원 ${quantity}개 ${promotionName}`);
    }
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