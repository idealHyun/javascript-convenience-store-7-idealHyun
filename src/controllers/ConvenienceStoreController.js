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
    this.#outputView.printWelcomeMessage();
    const productList = await this.#convenienceStore.loadInitData();
    this.#printConvenienceStoreStorage(productList);
  }

  #printConvenienceStoreStorage(productList) {
    productList.forEach((product) => {
      const productInfoDTO = ProductInfoDTO.of(this.#convenienceStore.getProductInfo(product));
      this.#outputView.printProductInfo(productInfoDTO);
    })
  }
}

export default ConvenienceStoreController;
