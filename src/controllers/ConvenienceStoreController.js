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

    await this.#retryInputUntilSuccess(
      () => this.#inputView.getInputProductAndQuantity(),
      (productAndQuantityInput) => this.#processAllProductStocksToSell(productAndQuantityInput)
    );

    await this.#inputView.getUseMembershipDiscount();

    // TODO: 영수증 리턴해서 DTO 만들어서 outputView 에 넘겨주기

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

    if (maxPromotionQuantity === 0) {
      // this.#receipt.addNotAppliedPromotionProduct(productStockToSell);
      return;
    }

    const isExceed = this.#convenienceStore.isExceedPromotionStock(productStockToSell);

    if (isExceed) {
      // 정가 결제할 수량
      const quantity = productStockToSell.getQuantity() - maxPromotionQuantity;
      const productPromotionInfoDTO = ProductPromotionInfoDTO.of(productStockToSell.getProductName(), quantity);

      this.#outputView.printExceedPromotionProductInfo(productPromotionInfoDTO);
      const userDecision = await this.#inputView.getInputYesOrNo();

      if (userDecision) {
        // 재고 차감
        this.#convenienceStore.decrementProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity());
        // 초과 수량 정가 결제
        // TODO : 영수증에 어떻게 추가할래
        // 영수증에 프로모션 적용된건 maxQuantity 만큼 추가
        // 일반결제하는건 quantity 만큼 추가
        // TODO :증정품은 개수 구해서 넣어야함
      }else{
        // 재고 차감
        this.#convenienceStore.decrementProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity()-quantity);
        // 초과 수량은 결제하지 않음
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
          // 1개 증정 받기
        }else{
          // 1개 증정 받지 않기
        }
      } else{
        // 그냥 재고 감소
        this.#convenienceStore.decrementProductQuantity(isExceed,productStockToSell.getProductName(),productStockToSell.getQuantity());
      }
    }
  }


  async #retryInputUntilSuccess(inputFunction, taskFunction) {
    while (true) {
      try {
        const result = await inputFunction();
        await taskFunction(result);

        return;
      } catch (error) {
        this.#outputView.printMessage(error.message);
      }
    }
  }
}

export default ConvenienceStoreController;
