import ProductInfoDTO from '../dtos/ProductInfoDTO.js';
import ProductPromotionInfoDTO from '../dtos/ProductPromotionInfoDTO.js';
import productPromotionInfoDTO from '../dtos/ProductPromotionInfoDTO.js';

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
    const productList = await this.#convenienceStore.loadInitData();

    this.#outputView.printWelcomeMessage();
    this.#printConvenienceStoreStorage(productList);

    const productAndQuantityInput = await this.#inputView.getInputProductAndQuantity();
    const productStocksToSell = this.#convenienceStore.getProductStocksToSell(productAndQuantityInput);
    productStocksToSell.forEach(productStockToSell => {
      this.#processToSell(productStockToSell)

    })
  }

  #printConvenienceStoreStorage(productList) {
    productList.forEach((product) => {
      const productInfoDTO = ProductInfoDTO.of(this.#convenienceStore.getProductInfo(product));
      this.#outputView.printProductInfo(productInfoDTO);
    })
  }

  async #processToSell(productStock){
    const maxPromotionQuantity = this.#convenienceStore.getMaxPromotionQuantity(productStock)

    if(maxPromotionQuantity > 0){
      if(this.#convenienceStore.isExceedPromotionStock(productStock)){
        const exceedCount = this.#convenienceStore.getExceedCount(productStock);
        const productPromotionInfoDTO =  ProductPromotionInfoDTO.of(productStock.getProductName(),exceedCount);
        this.#outputView.printExceedPromotionProductInfo(productPromotionInfoDTO);
        await this.#inputView.getInputYesOrNo();
      } else{
        const bonusProductQuantity = maxPromotionQuantity - productStock.getQuantity();
        if(bonusProductQuantity > 0){
          const productPromotionInfoDTO =  ProductPromotionInfoDTO.of(productStock.getProductName(),bonusProductQuantity);
          this.#outputView.printGuidePromotionProductInfo(productPromotionInfoDTO);
          await this.#inputView.getInputYesOrNo();
        }
      }
    } else{
      // 그냥 계산
    }

  }
}

export default ConvenienceStoreController;
