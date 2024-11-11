import ProductDTO from '../dtos/ProductDTO.js';
import ProductPromotionDTO from '../dtos/ProductPromotionDTO.js';

class ConvenienceStoreController {
  #convenienceStore;
  #inputView;
  #outputView;

  constructor(convenienceStore, inputView, outputView) {
    this.#convenienceStore = convenienceStore;
    this.#inputView = inputView;
    this.#outputView = outputView;
  }

  async run() {
    await this.#initializeStore();
    let isRepurchase;
    do {
      await this.#displayStoreStorage();
      const productStocksToSell = await this.#getInputPurchaseProducts();
      await this.#processAllProductStocksToSell(productStocksToSell);

      await this.#handleMembershipDiscount();
      isRepurchase = await this.#handleRepurchase();
    } while (isRepurchase);
  }

  // 편의점 초기 설정
  async #initializeStore() {
    await this.#convenienceStore.loadInitData();
  }

  // 환영 메시지와 편의점 상품 목록을 출력
  async #displayStoreStorage() {
    const productList = this.#convenienceStore.getProductList();
    this.#outputView.printWelcomeMessage();
    this.#printStoreStorage(productList);
  }

  // 멤버십 할인 적용 여부를 입력 받고 처리
  async #handleMembershipDiscount() {
    await this.#retryInputUntilSuccess(
      () => this.#inputView.getUseMembershipDiscount(),
      (applyDiscount) => {
        const receiptDTO =
          this.#convenienceStore.calculatePurchaseRecord(applyDiscount);
        this.#outputView.printReceipt(receiptDTO);
      },
    );
  }

  // 재구매 여부를 처리
  async #handleRepurchase() {
    let isRepurchase = false;
    await this.#retryInputUntilSuccess(
      () => this.#inputView.getInputRepurchase(),
      (repurchase) => {
        isRepurchase = repurchase;
      },
    );
    return isRepurchase;
  }

  #convertToProductStocks(productAndQuantityInput) {
    return this.#convenienceStore.getProductStocksToSell(
      productAndQuantityInput,
    );
  }

  async #processAllProductStocksToSell(productStocksToSell) {
    this.#convenienceStore.createReceipt();

    for (const productStockToSell of productStocksToSell) {
      await this.#processToSell(productStockToSell);
    }
  }

  async #getInputPurchaseProducts() {
    while (true) {
      try {
        const productAndQuantityInput =
          await this.#inputView.getInputProductAndQuantity();

        return this.#convertToProductStocks(productAndQuantityInput);
      } catch (error) {
        this.#outputView.printMessage(error.message);
      }
    }
  }

  #printStoreStorage(productList) {
    productList.forEach((product) => {
      const productInfoDTO = ProductDTO.of(
        this.#convenienceStore.getProductInfo(product),
      );
      this.#outputView.printProductInfo(productInfoDTO);
    });
  }

  async #processToSell(productStockToSell) {
    const productName = productStockToSell.getProductName();
    const purchaseQuantity = productStockToSell.getQuantity();
    const maxPromotionQuantity =
      this.#getMaxPromotionQuantity(productStockToSell);

    if (this.#isNoPromotionAvailable(productName, purchaseQuantity)) {
      return;
    }

    if (this.checkPromotionStockQuantityExceeded(productStockToSell)) {
      await this.#handleExceedPromotionStock(
        productName,
        purchaseQuantity,
        maxPromotionQuantity,
      );
    } else {
      await this.#handlePromotionWithinLimits(
        productName,
        purchaseQuantity,
        maxPromotionQuantity,
      );
    }
  }

  // 프로모션이 없거나 프로모션 재고가 없을 경우 처리
  #isNoPromotionAvailable(productName, purchaseQuantity) {
    if (
      !this.#isPromotionAvailable(productName) ||
      this.#convenienceStore.getPromotionProductQuantity(productName) === 0
    ) {
      this.#processNoPromotionProduct(productName, purchaseQuantity);
      return true;
    }
    return false;
  }

  // 프로모션 재고 초과 시 처리
  async #handleExceedPromotionStock(
    productName,
    purchaseQuantity,
    maxPromotionQuantity,
  ) {
    const quantityToPayFullPrice = purchaseQuantity - maxPromotionQuantity;
    const productPromotionInfoDTO = ProductPromotionDTO.of(
      productName,
      quantityToPayFullPrice,
    );

    await this.#retryInputWithMessage(
      () =>
        this.#outputView.printExceedPromotionProductInfo(
          productPromotionInfoDTO,
        ),
      () => this.#inputView.getInputYesOrNo(),
      (userDecision) => {
        if (userDecision) {
          this.#applyFullPromotionPurchase(
            productName,
            purchaseQuantity,
            quantityToPayFullPrice,
            maxPromotionQuantity,
          );
          this.#addBonusToReceipt(productName, maxPromotionQuantity);
        }
      },
    );
  }

  // 프로모션 재고 내에서 처리
  async #handlePromotionWithinLimits(
    productName,
    purchaseQuantity,
    maxPromotionQuantity,
  ) {
    const bonusQuantity = maxPromotionQuantity - purchaseQuantity;

    if (maxPromotionQuantity > purchaseQuantity) {
      await this.#offerFullOrPartialPromotion(
        productName,
        purchaseQuantity,
        bonusQuantity,
      );
    } else {
      this.#applyDirectPromotion(
        productName,
        purchaseQuantity,
        maxPromotionQuantity,
      );
    }
  }

  // 사용자가 전체 혹은 일부 프로모션 적용을 선택할 수 있도록 처리
  async #offerFullOrPartialPromotion(
    productName,
    purchaseQuantity,
    bonusQuantity,
  ) {
    await this.#retryInputWithMessage(
      () =>
        this.#outputView.printGuidePromotionProductInfo(
          ProductPromotionDTO.of(productName, bonusQuantity),
        ),
      () => this.#inputView.getInputYesOrNo(),
      (userDecision) => {
        if (userDecision) {
          this.#applyFullPromotion(
            productName,
            purchaseQuantity,
            bonusQuantity,
          );
        } else {
          this.#applyPartialPromotion(
            productName,
            purchaseQuantity,
            bonusQuantity,
          );
        }
      },
    );
  }

  #isPromotionAvailable(productName) {
    return this.#convenienceStore.isHavePromotion(productName);
  }

  #processNoPromotionProduct(productName, purchaseQuantity) {
    this.#convenienceStore.decrementProductQuantity(
      productName,
      purchaseQuantity,
    );
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(
      productName,
      purchaseQuantity,
    );
  }

  #getMaxPromotionQuantity(productStockToSell) {
    return this.#convenienceStore.getMaxPromotionQuantity(productStockToSell);
  }

  checkPromotionStockQuantityExceeded(productStockToSell) {
    return this.#convenienceStore.isExceedPromotionStockQuantity(
      productStockToSell,
    );
  }

  #applyFullPromotionPurchase(
    productName,
    purchaseQuantity,
    quantityToPayFullPrice,
    maxPromotionQuantity,
  ) {
    this.#convenienceStore.decrementPromotionProductQuantity(
      true,
      productName,
      purchaseQuantity,
    );
    this.#convenienceStore.addAppliedPromotionProductToReceipt(
      productName,
      maxPromotionQuantity,
    );
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(
      productName,
      quantityToPayFullPrice,
    );
  }

  // 구매 개수가 프로모션 적요이 가능하여 사용자의 선택으로 적용하였을 경우
  #applyFullPromotion(productName, purchaseQuantity, extraQuantity) {
    const totalQuantity = purchaseQuantity + extraQuantity;
    this.#convenienceStore.decrementPromotionProductQuantity(
      false,
      productName,
      totalQuantity,
    );
    this.#convenienceStore.addAppliedPromotionProductToReceipt(
      productName,
      totalQuantity,
    );
    this.#addBonusToReceipt(productName, totalQuantity);
  }

  // 구매 개수가 프로모션을 적용시킬 수 있었지만 사용자의 선택으로 적용하지 않았을 경우
  #applyPartialPromotion(productName, purchaseQuantity, extraQuantity) {
    const promotionSetSize =
      this.#convenienceStore.getPromotionSetSize(productName);
    const quantityInPromotion =
      purchaseQuantity + extraQuantity - promotionSetSize;
    const quantityNotInPromotion = purchaseQuantity % promotionSetSize;

    this.#convenienceStore.decrementPromotionProductQuantity(
      false,
      productName,
      purchaseQuantity,
    );
    this.#convenienceStore.addAppliedPromotionProductToReceipt(
      productName,
      quantityInPromotion,
    );
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(
      productName,
      quantityNotInPromotion,
    );
    this.#addBonusToReceipt(productName, quantityInPromotion);
  }

  // 구매 개수가 프로모션을 적용한 개수일 때 처리
  #applyDirectPromotion(productName, purchaseQuantity, maxPromotionQuantity) {
    this.#convenienceStore.decrementPromotionProductQuantity(
      false,
      productName,
      purchaseQuantity,
    );
    this.#convenienceStore.addAppliedPromotionProductToReceipt(
      productName,
      maxPromotionQuantity,
    );
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(
      productName,
      purchaseQuantity - maxPromotionQuantity,
    );
    this.#addBonusToReceipt(productName, maxPromotionQuantity);
  }

  #addBonusToReceipt(productName, quantity) {
    const bonusCount = this.#convenienceStore.getBonusProductCount(
      productName,
      quantity,
    );
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
