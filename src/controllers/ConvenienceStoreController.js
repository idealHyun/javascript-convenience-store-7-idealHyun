import ProductInfoDTO from '../dtos/ProductInfoDTO.js';
import ProductPromotionInfoDTO from '../dtos/ProductPromotionInfoDTO.js';

class ConvenienceStoreController {
  #convenienceStore;
  #receipt;
  #inputView;
  #outputView;

  constructor(convenienceStore, receipt, inputView, outputView) {
    this.#convenienceStore = convenienceStore;
    this.#receipt = receipt;
    this.#inputView = inputView;
    this.#outputView = outputView;
  }

  async run() {
    const productList = await this.#convenienceStore.loadInitData();

    this.#outputView.printWelcomeMessage();
    this.#printConvenienceStoreStorage(productList);

    await this.#retryInputUntilSuccess(
      () => this.#inputView.getInputProductAndQuantity(),
      (productAndQuantityInput) => this.#processAllProductStocksToSell(productAndQuantityInput)
    );

    await this.#inputView.getUseMembershipDiscount();

    // TODO: 영수증 보여주기

    await this.#inputView.getInputRepurchase();
  }

  async #processAllProductStocksToSell(productAndQuantityInput) {
    const productStocksToSell = this.#convenienceStore.getProductStocksToSell(productAndQuantityInput);

    for (const productStockToSell of productStocksToSell) {
      await this.#processToSell(productStockToSell);
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

    // 프로모션의 영향을 받지 않고 그냥 결제하는 경우
    if (maxPromotionQuantity === 0) {
      this.#receipt.addNotAppliedPromotionProduct(productStockToSell);
      return;
    }

    const productPromotionInfoDTO = await this.#getPromotionInfoDTO(productStockToSell, maxPromotionQuantity);
    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStockToSell);

    await this.#handlePromotionDecision(productPromotionInfoDTO, isExceed, productStockToSell);
  }

  async #getPromotionInfoDTO(productStock, maxPromotionQuantity) {
    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStock);
    let quantity;
    if (isExceed){
      quantity = productStock.getQuantity() - maxPromotionQuantity;
      // quantity = this.#convenienceStore.getExceedCount(productStock);
    } else{
      quantity = maxPromotionQuantity - productStock.getQuantity();
    }

    return this.#createPromotionInfoDTO(productStock.getProductName(), quantity);
  }

  // 프로모션 여부에 따른 출력 및 사용자 입력 처리
  async #handlePromotionDecision(productPromotionInfoDTO, isExceed, productStock) {
    if (isExceed) {
      this.#outputView.printExceedPromotionProductInfo(productPromotionInfoDTO);
    } else {
      this.#outputView.printGuidePromotionProductInfo(productPromotionInfoDTO);
    }

    const userDecision = await this.#inputView.getInputYesOrNo();
    if (userDecision) {
      await this.#applyPromotion(isExceed, productStock);
    }
  }

  // 사용자 확인 후 프로모션 적용 처리
  async #applyPromotion(isExceed, productStock) {
    if (isExceed) {
      // TODO: 프로모션 재고 차감하고 일반재고 차감하기
      // TODO: 증정 개수 계산해서 증정에 추가하기
      // TODO: 나머지는 구매한 물품에 추가하기
    } else {
      // TODO: 프로모션 재고 차감하기
      // TODO: 프로모션 물건 증정에 추가하기
    }
  }

  #createPromotionInfoDTO(productName, quantity) {
    return ProductPromotionInfoDTO.of(productName, quantity);
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
}

export default ConvenienceStoreController;
