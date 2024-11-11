import ProductInfoDTO from '../dtos/ProductInfoDTO.js';
import ProductPromotionInfoDTO from '../dtos/ProductPromotionInfoDTO.js';

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

  // 재구매 여부를 처리하는 메서드
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
    // 영수증 클래스 생성
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
      const productInfoDTO = ProductInfoDTO.of(
        this.#convenienceStore.getProductInfo(product),
      );
      this.#outputView.printProductInfo(productInfoDTO);
    });
  }

  async #processToSell(productStockToSell) {
    const productName = productStockToSell.getProductName();
    const purchaseQuantity = productStockToSell.getQuantity();

    if (!this.#isPromotionAvailable(productName)) {
      this.#processNonPromotionProduct(productName, purchaseQuantity);
      return;
    }

    const maxPromotionQuantity =
      this.#getMaxPromotionQuantity(productStockToSell);
    await this.#processPromotionProduct(
      productStockToSell,
      productName,
      purchaseQuantity,
      maxPromotionQuantity,
    );
  }

  // 프로모션 여부 확인
  #isPromotionAvailable(productName) {
    return this.#convenienceStore.isHavePromotion(productName);
  }

  // 프로모션이 없는 경우 처리
  #processNonPromotionProduct(productName, purchaseQuantity) {
    this.#convenienceStore.decrementProductQuantity(
      productName,
      purchaseQuantity,
    );
    this.#convenienceStore.addNotAppliedPromotionProductToReceipt(
      productName,
      purchaseQuantity,
    );
  }

  // 최대 프로모션 수량을 가져오는 메서드
  #getMaxPromotionQuantity(productStockToSell) {
    return this.#convenienceStore.getMaxPromotionQuantity(productStockToSell);
  }

  // 프로모션이 있는 경우 처리
  async #processPromotionProduct(
    productStockToSell,
    productName,
    purchaseQuantity,
    maxPromotionQuantity,
  ) {
    const isPromotionStockSufficient =
      this.#isPromotionStockSufficient(productStockToSell);

    if (isPromotionStockSufficient) {
      await this.#handleSufficientPromotionStock(
        productStockToSell,
        productName,
        purchaseQuantity,
        maxPromotionQuantity,
      );
    } else {
      await this.#handleInsufficientPromotionStock(
        productStockToSell,
        productName,
        purchaseQuantity,
        maxPromotionQuantity,
      );
    }
  }

  // 프로모션 재고가 충분한지 확인
  #isPromotionStockSufficient(productStockToSell) {
    return this.#convenienceStore.isExceedPromotionStock(productStockToSell);
  }

  // 프로모션 재고가 충분할 때의 처리
  async #handleSufficientPromotionStock(
    productStockToSell,
    productName,
    purchaseQuantity,
    maxPromotionQuantity,
  ) {
    const quantityToPayFullPrice = purchaseQuantity - maxPromotionQuantity;
    const productPromotionInfoDTO = ProductPromotionInfoDTO.of(
      productName,
      quantityToPayFullPrice,
    );

    await this.#retryInputWithMessage(
      () =>
        this.#outputView.printExceedPromotionProductInfo(
          productPromotionInfoDTO,
        ),
      () => this.#inputView.getInputYesOrNo(),
      (userDecision) =>
        this.#applyPromotionWithUserDecision(
          userDecision,
          productName,
          purchaseQuantity,
          quantityToPayFullPrice,
          maxPromotionQuantity,
        ),
    );
  }

  // 프로모션 재고가 부족할 때의 처리
  async #handleInsufficientPromotionStock(
    productStockToSell,
    productName,
    purchaseQuantity,
    maxPromotionQuantity,
  ) {
    const extraQuantity = maxPromotionQuantity - purchaseQuantity;
    if (maxPromotionQuantity > purchaseQuantity) {
      await this.#retryInputWithMessage(
        () =>
          this.#outputView.printGuidePromotionProductInfo(
            ProductPromotionInfoDTO.of(productName, extraQuantity),
          ),
        () => this.#inputView.getInputYesOrNo(),
        (userDecision) =>
          this.#applyPromotionWithExtraQuantityDecision(
            userDecision,
            productName,
            purchaseQuantity,
            extraQuantity,
          ),
      );
    } else {
      this.#applyDirectPromotion(
        productName,
        purchaseQuantity,
        maxPromotionQuantity,
      );
    }
  }

  // 사용자 결정에 따른 프로모션 적용
  #applyPromotionWithUserDecision(
    userDecision,
    productName,
    purchaseQuantity,
    quantityToPayFullPrice,
    maxPromotionQuantity,
  ) {
    if (userDecision) {
      this.#applyFullPromotionPurchase(
        productName,
        purchaseQuantity,
        quantityToPayFullPrice,
        maxPromotionQuantity,
      );
    } else {
      this.#applyPartialPromotionPurchase(
        productName,
        purchaseQuantity,
        quantityToPayFullPrice,
        maxPromotionQuantity,
      );
    }
    this.#addBonusToReceipt(productName, maxPromotionQuantity);
  }

  // 사용자가 전체 프로모션 수량을 구매한 경우의 처리
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

  // 사용자가 일부 프로모션 수량만 구매한 경우의 처리
  #applyPartialPromotionPurchase(
    productName,
    purchaseQuantity,
    quantityToPayFullPrice,
    maxPromotionQuantity,
  ) {
    this.#convenienceStore.decrementPromotionProductQuantity(
      true,
      productName,
      purchaseQuantity - quantityToPayFullPrice,
    );
    this.#convenienceStore.addAppliedPromotionProductToReceipt(
      productName,
      maxPromotionQuantity,
    );
  }

  // 프로모션 부족 시 추가 수량에 대한 사용자 결정 처리
  #applyPromotionWithExtraQuantityDecision(
    userDecision,
    productName,
    purchaseQuantity,
    extraQuantity,
  ) {
    if (userDecision) {
      this.#applyFullPromotion(productName, purchaseQuantity, extraQuantity);
    } else {
      this.#applyPartialPromotion(productName, purchaseQuantity, extraQuantity);
    }
  }

  // 사용자가 추가 수량을 구매할 경우의 프로모션 처리
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

  // 사용자가 추가 수량을 구매하지 않을 경우의 프로모션 처리
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

  // 프로모션 적용 직접 처리
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

  // 보너스 상품을 영수증에 추가
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
