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

    // 프로모션이 없는 제품의 경우
    if (maxPromotionQuantity === 0) {
      this.#handleNoPromotionCase(productName, purchaseQuantity);
      return;
    }

    // 구매 수량이 프로모션 재고를 초과하는지 확인
    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStockToSell);

    if (isExceed) {
      await this.#handleExceedPromotion(productStockToSell, maxPromotionQuantity, productName, purchaseQuantity);
    } else {
      await this.#handleWithinPromotion(productStockToSell, maxPromotionQuantity, productName, purchaseQuantity);
    }
  }

  #handleNoPromotionCase(productName, quantity) {
    this.#convenienceStore.decrementProductQuantity(productName, quantity);
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, quantity);
  }

  async #handleExceedPromotion(productStockToSell, maxPromotionQuantity, productName, purchaseQuantity) {
    const quantityToPayFullPrice = purchaseQuantity - maxPromotionQuantity;
    const productPromotionInfoDTO = ProductPromotionInfoDTO.of(productName, quantityToPayFullPrice);

    await this.#retryInputWithMessage(
      () => this.#outputView.printExceedPromotionProductInfo(productPromotionInfoDTO),
      () => this.#inputView.getInputYesOrNo(),
      (userDecision) => {
        if (userDecision) {
          this.#applyExceedPromotion(productName, maxPromotionQuantity, purchaseQuantity, quantityToPayFullPrice);
        } else {
          this.#skipExceedPromotion(productName, maxPromotionQuantity, purchaseQuantity, quantityToPayFullPrice);
        }
      }
    );
  }

  async #handleWithinPromotion(productStockToSell, maxPromotionQuantity, productName, purchaseQuantity) {
    const extraQuantity = maxPromotionQuantity - purchaseQuantity;
    if (extraQuantity > 0) {
      await this.#retryInputWithMessage(
        () => this.#outputView.printGuidePromotionProductInfo(ProductPromotionInfoDTO.of(productName, extraQuantity)),
        () => this.#inputView.getInputYesOrNo(),
        (userDecision) => {
          if (userDecision) {
            this.#applyWithinPromotionWithExtra(productName, purchaseQuantity, extraQuantity);
          } else {
            this.#skipWithinPromotionWithExtra(productName, purchaseQuantity, extraQuantity);
          }
        }
      );
    } else {
      this.#applyWithinPromotionWithoutExtra(productName, purchaseQuantity, maxPromotionQuantity);
    }
  }

  #applyExceedPromotion(productName, maxPromotionQuantity, purchaseQuantity, quantityToPayFullPrice) {
    this.#convenienceStore.decrementPromotionProductQuantity(true, productName, purchaseQuantity);
    this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, maxPromotionQuantity);
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, quantityToPayFullPrice);
    this.#addBonusToReceipt(productName, maxPromotionQuantity);
  }

  #skipExceedPromotion(productName, maxPromotionQuantity, purchaseQuantity, quantityToPayFullPrice) {
    this.#convenienceStore.decrementPromotionProductQuantity(true, productName, purchaseQuantity - quantityToPayFullPrice);
    this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, maxPromotionQuantity);
    this.#addBonusToReceipt(productName, maxPromotionQuantity);
  }

  #applyWithinPromotionWithExtra(productName, quantity, extraQuantity) {
    const totalQuantity = quantity + extraQuantity;
    this.#convenienceStore.decrementPromotionProductQuantity(false, productName, totalQuantity);
    this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, totalQuantity);
    this.#addBonusToReceipt(productName, totalQuantity);
  }

  #skipWithinPromotionWithExtra(productName, quantity, extraQuantity) {
    this.#convenienceStore.decrementPromotionProductQuantity(false, productName, quantity);
    const promotionSetSize = this.#convenienceStore.getPromotionSetSize(productName);
    const quantityInPromotion = quantity + extraQuantity - promotionSetSize;
    const quantityNotInPromotion = quantity % promotionSetSize;

    this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, quantityInPromotion);
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, quantityNotInPromotion);
    this.#addBonusToReceipt(productName, quantityInPromotion);
  }

  #applyWithinPromotionWithoutExtra(productName, quantity, maxPromotionQuantity) {
    this.#convenienceStore.decrementPromotionProductQuantity(false, productName, quantity);
    this.#convenienceStore.addAppliedPromotionProductToReceipt(productName, maxPromotionQuantity);
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productName, quantity - maxPromotionQuantity);
    this.#addBonusToReceipt(productName, maxPromotionQuantity);
  }

  #addBonusToReceipt(productName, quantity) {
    const bonusCount = this.#convenienceStore.getBonusProductCount(productName, quantity);
    this.#convenienceStore.addBonusProductToReceipt(productName, bonusCount);
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
