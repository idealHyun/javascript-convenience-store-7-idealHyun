import ProductInfoDTO from '../dtos/ProductInfoDTO.js';
import ProductPromotionInfoDTO from '../dtos/ProductPromotionInfoDTO.js';

class ConvenienceStoreController {
  #convenienceStore;
  #inputView;
  #outputView;

  constructor(convenienceStore,inputView, outputView) {
    this.#convenienceStore = convenienceStore;
    this.#inputView = inputView;
    this.#outputView = outputView;
  }

  async run() {
    await this.#convenienceStore.loadInitData();
    let isRepurchase;
    do {
      const productList = this.#convenienceStore.getProductList();
      this.#outputView.printWelcomeMessage();
      this.#printConvenienceStoreStorage(productList);

      const productStocksToSell = await this.#getInputPurchaseProducts();
      await this.#processAllProductStocksToSell(productStocksToSell);

      await this.#retryInputUntilSuccess(
        () => this.#inputView.getUseMembershipDiscount(),
        (applyDiscount) => {
          const receiptDTO = this.#convenienceStore.calculatePurchaseRecord(applyDiscount);
          this.#outputView.printReceipt(receiptDTO);
        }
      );

      await this.#retryInputUntilSuccess(
        () => this.#inputView.getInputRepurchase(),
        (repurchase) => {
          isRepurchase = repurchase;
        }
      );
    } while (isRepurchase);
  }

  #convertToProductStocks(productAndQuantityInput){
    return this.#convenienceStore.getProductStocksToSell(productAndQuantityInput);
  }

  async #processAllProductStocksToSell(productStocksToSell) {
    // 영수증 클래스 생성시키기
    this.#convenienceStore.createReceipt();

    for (const productStockToSell of productStocksToSell) {
      await this.#processToSell(productStockToSell);
    }
  }

  async #getInputPurchaseProducts(){
    while (true) {
      try {
        const productAndQuantityInput = await this.#inputView.getInputProductAndQuantity();

        return this.#convertToProductStocks(productAndQuantityInput);
      } catch (error) {
        this.#outputView.printMessage(error.message);
      }
    }
  }

  #printConvenienceStoreStorage(productList) {
    productList.forEach((product) => {
      const productInfoDTO = ProductInfoDTO.of(this.#convenienceStore.getProductInfo(product));
      this.#outputView.printProductInfo(productInfoDTO);
    });
  }

  async #processToSell(productStockToSell) {
    const maxPromotionQuantity = this.#convenienceStore.getMaxPromotionQuantity(productStockToSell);
    const productName = productStockToSell.getProductName();
    const purchaseQuantity = productStockToSell.getQuantity();

    // 프로모션이 없는 경우
    if(!this.#convenienceStore.isHavePromotion(productName)){
      this.#convenienceStore.decrementProductQuantity(productName,purchaseQuantity);
      this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName,purchaseQuantity);
      return ;
    }

    // 구매 수량이 프로모션 재고를 초과하는지
    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStockToSell);

    if (isExceed) {
      const quantityToPayFullPrice = purchaseQuantity - maxPromotionQuantity;
      const productPromotionInfoDTO = ProductPromotionInfoDTO.of(productName, quantityToPayFullPrice);

      await this.#retryInputWithMessage(
        () => this.#outputView.printExceedPromotionProductInfo(productPromotionInfoDTO),
        () => this.#inputView.getInputYesOrNo(),
        (userDecision) => {
          if (userDecision) {
            this.#convenienceStore.decrementPromotionProductQuantity(true, productName, purchaseQuantity);
            this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, maxPromotionQuantity);
            this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, quantityToPayFullPrice);
            const bonusCount = this.#convenienceStore.getBonusProductCount(productName, maxPromotionQuantity);
            this.#convenienceStore.addBonusProductToReceipt(productName, bonusCount);
          } else {
            this.#convenienceStore.decrementPromotionProductQuantity(true, productName, purchaseQuantity - quantityToPayFullPrice);
            this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, maxPromotionQuantity);
            const bonusCount = this.#convenienceStore.getBonusProductCount(productName, maxPromotionQuantity);
            this.#convenienceStore.addBonusProductToReceipt(productName, bonusCount);
          }
        }
      );
    } else {
      const extraQuantity = maxPromotionQuantity - purchaseQuantity;
      if (extraQuantity > 0) {
        await this.#retryInputWithMessage(
          () => this.#outputView.printGuidePromotionProductInfo(ProductPromotionInfoDTO.of(productName, extraQuantity)),
          () => this.#inputView.getInputYesOrNo(),
          (userDecision) => {
            if (userDecision) {
              const totalQuantity = purchaseQuantity + extraQuantity;
              this.#convenienceStore.decrementPromotionProductQuantity(false, productName, totalQuantity);
              this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, totalQuantity);
              const bonusCount = this.#convenienceStore.getBonusProductCount(productName, totalQuantity);
              this.#convenienceStore.addBonusProductToReceipt(productName, bonusCount);
            } else {
              this.#convenienceStore.decrementPromotionProductQuantity(false, productName, purchaseQuantity);
              const promotionSetSize = this.#convenienceStore.getPromotionSetSize(productName);
              const quantityInPromotion = purchaseQuantity + extraQuantity - promotionSetSize;
              const quantityNotInPromotion = purchaseQuantity % promotionSetSize;

              this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, quantityInPromotion);
              this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, quantityNotInPromotion);
              const bonusCount = this.#convenienceStore.getBonusProductCount(productName, quantityInPromotion);
              this.#convenienceStore.addBonusProductToReceipt(productName, bonusCount);
            }
          }
        );
      } else {
        this.#convenienceStore.decrementPromotionProductQuantity(false, productName, purchaseQuantity);
        this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, maxPromotionQuantity);
        this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, purchaseQuantity - maxPromotionQuantity);
        const bonusCount = this.#convenienceStore.getBonusProductCount(productName, maxPromotionQuantity);
        this.#convenienceStore.addBonusProductToReceipt(productName, bonusCount);
      }
    }
  }

  async #retryInputUntilSuccess(inputFunction, taskFunction) {
    while (true) {
      try {
        const result = await inputFunction();
        taskFunction(result);

        return;
      } catch (error) {
        this.#outputView.printMessage(error.message);
      }
    }
  }

  async #retryInputWithMessage(messageFunction, inputFunction, taskFunction) {
    while (true) {
      try {
        messageFunction();
        const result = await inputFunction();
        taskFunction(result);
        return;
      } catch (error) {
        this.#outputView.printMessage(error.message);
      }
    }
  }
}

export default ConvenienceStoreController;
