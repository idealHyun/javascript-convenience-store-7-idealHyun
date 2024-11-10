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
    const productList = await this.#convenienceStore.loadInitData();

    this.#outputView.printWelcomeMessage();
    this.#printConvenienceStoreStorage(productList);

    while (true) {
      try {
        const productAndQuantityInput = await this.#inputView.getInputProductAndQuantity();
        await this.#processAllProductStocksToSell(productAndQuantityInput);
        break;
      } catch (error) {
        this.#outputView.printMessage(error.message);
      }
    }

    await this.#inputView.getUseMembershipDiscount();

    // TODO: 영수증 리턴해서 DTO 만들어서 outputView 에 넘겨주기

    await this.#inputView.getInputRepurchase();
  }

  async #processAllProductStocksToSell(productAndQuantityInput) {
    const productStocksToSell = this.#convenienceStore.getProductStocksToSell(productAndQuantityInput);
    // 영수증 클래스 생성시키기
    this.#convenienceStore.createReceipt();

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

    // 프로모션이 없는 제품의 경우
    if (maxPromotionQuantity === 0) {
      this.#convenienceStore.decrementProductQuantity(productStockToSell.getProductName(),productStockToSell.getQuantity());
      this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productStockToSell.getProductName(),productStockToSell.getQuantity());
      return;
    }

    // 구매 수량이 프로모션 재고를 넘어가는지에 대한 여부
    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStockToSell);

    if (isExceed) {
      // 정가 결제할 수량
      const quantity = productStockToSell.getQuantity() - maxPromotionQuantity;
      const productPromotionInfoDTO = ProductPromotionInfoDTO.of(productStockToSell.getProductName(), quantity);

      this.#outputView.printExceedPromotionProductInfo(productPromotionInfoDTO);
      const userDecision = await this.#inputView.getInputYesOrNo();

      if (userDecision) {
        // 재고 차감
        this.#convenienceStore.decrementPromotionProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity());
        // 초과 수량 정가 결제

        // 영수증에 프로모션 적용된건 maxQuantity 만큼 추가
        this.#convenienceStore.addAppliedPromotionProductToReceipt(productStockToSell.getProductName(),maxPromotionQuantity);
        // 일반결제하는건 quantity 만큼 추가
        this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productStockToSell.getProductName(),quantity)
        const bonusCount = this.#convenienceStore.getBonusProductCount(productStockToSell.getProductName(),maxPromotionQuantity);
        this.#convenienceStore.addBonusProductToReceipt(productStockToSell.getProductName(),bonusCount);
      }else{
        // 재고 차감
        this.#convenienceStore.decrementPromotionProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity()-quantity);
        // 초과 수량은 결제하지 않음
        this.#convenienceStore.addAppliedPromotionProductToReceipt(productStockToSell.getProductName(),maxPromotionQuantity);
        const bonusCount = this.#convenienceStore.getBonusProductCount(productStockToSell.getProductName(),maxPromotionQuantity);
        this.#convenienceStore.addBonusProductToReceipt(productStockToSell.getProductName(),bonusCount);
      }

    } else {
      // 증정 받을 수량
      const quantity = maxPromotionQuantity - productStockToSell.getQuantity();
      // 증정 받을 수량이 있으면 메세지 출력
      if(quantity>0){
        const productPromotionInfoDTO = ProductPromotionInfoDTO.of(productStockToSell.getProductName(), quantity);

        this.#outputView.printGuidePromotionProductInfo(productPromotionInfoDTO);
        const userDecision = await this.#inputView.getInputYesOrNo();

        if (userDecision) {
          // 증정 받을 수량 추가해서 재고 감소
          this.#convenienceStore.decrementPromotionProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity()+quantity);
          // 1개 증정 받고 영수증 프로모션 적용에 추가
          this.#convenienceStore.addAppliedPromotionProductToReceipt(productStockToSell.getProductName(),productStockToSell.getQuantity()+quantity);
          const bonusCount = this.#convenienceStore.getBonusProductCount(productStockToSell.getProductName(),maxPromotionQuantity);
          this.#convenienceStore.addBonusProductToReceipt(productStockToSell.getProductName(),bonusCount);
        }else{
          // 증정 받을 수량 추가하지 않고 재고 감소
          this.#convenienceStore.decrementPromotionProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity());
          // 1개 증정 받지 않고 영수증 프로모션 미적용에 추가
          const promotionSetSize = this.#convenienceStore.getPromotionSetSize(productStockToSell.getProductName());

          this.#convenienceStore.addAppliedPromotionProductToReceipt(productStockToSell.getProductName(),productStockToSell.getQuantity() + quantity - promotionSetSize);
          this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productStockToSell.getProductName(),productStockToSell.getQuantity() % promotionSetSize)
          const bonusCount = this.#convenienceStore.getBonusProductCount(productStockToSell.getProductName(),productStockToSell.getQuantity() + quantity - promotionSetSize);
          this.#convenienceStore.addBonusProductToReceipt(productStockToSell.getProductName(),bonusCount);
        }
      } else{
        // 그냥 재고 감소
        this.#convenienceStore.decrementPromotionProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity());

        this.#convenienceStore.addAppliedPromotionProductToReceipt(productStockToSell.getProductName(), maxPromotionQuantity);
        this.#convenienceStore.addNotAppliedPromotionProductToReceipt(productStockToSell.getProductName(),productStockToSell.getQuantity() - maxPromotionQuantity);

        const bonusCount = this.#convenienceStore.getBonusProductCount(productStockToSell.getProductName(),maxPromotionQuantity);
        this.#convenienceStore.addBonusProductToReceipt(productStockToSell.getProductName(),bonusCount);
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
}

export default ConvenienceStoreController;
