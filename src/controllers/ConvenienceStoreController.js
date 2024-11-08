class ConvenienceStoreController {
  #convenienceStore
  #inputView
  #outputView

  constructor(convenienceStore,inputView,outputView) {
    this.#convenienceStore = convenienceStore;
    this.#inputView = inputView;
    this.#outputView = outputView;
  }

  async run(){
    this.#outputView.printWelcomeMessage()
    const productList = await this.#convenienceStore.loadInitData();
    this.#printConvenienceStoreStorage(productList);
    
  }
  
  #printConvenienceStoreStorage(productList){
    // productList 로 Store 에서 매핑하기

  }
}

export default ConvenienceStoreController;