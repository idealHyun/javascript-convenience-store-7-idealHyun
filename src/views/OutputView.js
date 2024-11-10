import { Console } from '@woowacourse/mission-utils';
import { SYSTEM_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

class OutputView {
  #TAB = '\t';
  #TWO_TAB = '\t\t';
  #THREE_TAB = '\t\t\t';
  #FOUR_TAB = '\t\t\t\t';
  #THREE = 3;

  printMessage(message) {
    Console.print(message);
  }

  printWelcomeMessage() {
    Console.print(SYSTEM_MESSAGE.output.welcome);
  }

  printProductInfo(productInfoDTO) {
    this.#printPromotionProductInfo(
      productInfoDTO.getProductName(),
      productInfoDTO.getPrice(),
      productInfoDTO.getPromotionProductQuantity(),
      productInfoDTO.getPromotionName(),
    );
    this.#printProductInfo(
      productInfoDTO.getProductName(),
      productInfoDTO.getPrice(),
      productInfoDTO.getProductQuantity(),
    );
  }

  printExceedPromotionProductInfo(productPromotionInfoDTO) {
    Console.print(
      SYSTEM_MESSAGE.output.promotionExceedQuantity(
        productPromotionInfoDTO.getProductName(),
        productPromotionInfoDTO.getProductQuantity(),
      ),
    );
  }

  printGuidePromotionProductInfo(productPromotionInfoDTO) {
    Console.print(
      SYSTEM_MESSAGE.output.promotionGuide(
        productPromotionInfoDTO.getProductName(),
        productPromotionInfoDTO.getProductQuantity(),
      ),
    );
  }

  printReceipt(receiptDTO) {
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
      const productName = purchasedProductDTO.getName();
      let tabSize =
        productName.length > this.#THREE ? this.#TWO_TAB : this.#THREE_TAB;
      Console.print(
        `${productName} ${tabSize} ${purchasedProductDTO.getQuantity()} ${this.#TAB} ${purchasedProductDTO.getAmount().toLocaleString()}`,
      );
    });
  }

  #printBonusProducts(bonusProductDTOs) {
    bonusProductDTOs.forEach((bonusProductDTO) => {
      const productName = bonusProductDTO.getName();
      let tabSize =
        productName.length > this.#THREE ? this.#TWO_TAB : this.#THREE_TAB;
      Console.print(
        `${productName} ${tabSize} ${bonusProductDTO.getQuantity()}`,
      );
    });
  }

  #printTotalInfo(totalInfoDTO) {
    Console.print(
      `${STORE_CONFIG.totalQuantityWord} ${this.#TWO_TAB} ${totalInfoDTO.getTotalQuantity()} ${this.#TAB} ${totalInfoDTO.getTotalAmount().toLocaleString()}`,
    );
    Console.print(
      `${STORE_CONFIG.promotionalDiscountWord}${this.#THREE_TAB}-${totalInfoDTO.getPromotionDiscount().toLocaleString()}`,
    );
    Console.print(
      `${STORE_CONFIG.memberShipDiscountWord}${this.#THREE_TAB}-${totalInfoDTO.getMembershipDiscount().toLocaleString()}`,
    );
    Console.print(
      `${STORE_CONFIG.amountToPayWord}${this.#FOUR_TAB}${totalInfoDTO.getFinalAmount().toLocaleString()}`,
    );
  }

  #printPromotionProductInfo(productName, price, quantity, promotionName) {
    if (quantity === null || promotionName === null) {
      return;
    }
    if (quantity === 0) {
      Console.print(
        `- ${productName} ${price.toLocaleString()}${STORE_CONFIG.koreanMoneyUnit} ${STORE_CONFIG.outOfStock} ${promotionName}`,
      );
    } else {
      Console.print(
        `- ${productName} ${price.toLocaleString()}${STORE_CONFIG.koreanMoneyUnit} ${quantity}${STORE_CONFIG.productUnit} ${promotionName}`,
      );
    }
  }

  #printProductInfo(productName, price, quantity) {
    if (quantity < STORE_CONFIG.minimumProductQuantity || quantity === null) {
      Console.print(
        `- ${productName} ${price.toLocaleString()}${STORE_CONFIG.koreanMoneyUnit} ${STORE_CONFIG.outOfStock}`,
      );
      return;
    }
    Console.print(
      `- ${productName} ${price.toLocaleString()}${STORE_CONFIG.koreanMoneyUnit} ${quantity}${STORE_CONFIG.productUnit}`,
    );
  }
}

export default OutputView;
