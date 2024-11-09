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
    this.#convenienceStore.sell(productAndQuantityInput);
  }

  #printConvenienceStoreStorage(productList) {
    productList.forEach((product) => {
      const productInfoDTO = ProductInfoDTO.of(this.#convenienceStore.getProductInfo(product));
      this.#outputView.printProductInfo(productInfoDTO);
    })
  }
}

export default ConvenienceStoreController;
