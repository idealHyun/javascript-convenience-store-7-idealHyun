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
  }
}

export default ConvenienceStoreController;