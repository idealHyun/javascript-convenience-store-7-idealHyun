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

    const productAndQuantityInput = await this.#inputView.getInputProductAndQuantity();
    const productStocksToSell = this.#convenienceStore.getProductStocksToSell(productAndQuantityInput);
    for (const productStockToSell of productStocksToSell) {
      await this.#processToSell(productStockToSell);
    }
    await this.#inputView.getUseMembershipDiscount();
    await this.#inputView.getInputRepurchase();
    // TODO: 영수증 보여주기
  }

  #printConvenienceStoreStorage(productList) {
    productList.forEach((product) => {
      const productInfoDTO = ProductInfoDTO.of(this.#convenienceStore.getProductInfo(product));
      this.#outputView.printProductInfo(productInfoDTO);
    });
  }

  async #processToSell(productStock) {
    const maxPromotionQuantity = this.#convenienceStore.getMaxPromotionQuantity(productStock);

    if (maxPromotionQuantity <= 0) {
      this.#receipt.addNotAppliedPromotionProduct(productStock);
      return;
    }

    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStock);
    const quantity = isExceed
      ? this.#convenienceStore.getExceedCount(productStock)
      : maxPromotionQuantity - productStock.getQuantity();

    const dto = this.#createPromotionInfoDTO(productStock.getProductName(), quantity);

    await this.#handlePromotionDecision(dto, isExceed, productStock);
  }

  // 프로모션 여부에 따른 출력 및 사용자 입력 처리
  async #handlePromotionDecision(dto, isExceed, productStock) {
    if (isExceed) {
      this.#outputView.printExceedPromotionProductInfo(dto);
    } else {
      this.#outputView.printGuidePromotionProductInfo(dto);
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
}

export default ConvenienceStoreController;
