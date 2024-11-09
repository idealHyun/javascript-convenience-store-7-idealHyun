import ProductInfoDTO from '../dtos/ProductInfoDTO.js';

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

  #processToSell(productStock){
    const maxPromotionQuantity = this.#convenienceStore.getMaxPromotionQuantity(productStock)
    if(this.#convenienceStore.isExceedPromotionStock(productStock)){
      // TODO : 재고가 몇개 초과하는지 구한 후 입력받기
    }
  }
}

export default ConvenienceStoreController;
