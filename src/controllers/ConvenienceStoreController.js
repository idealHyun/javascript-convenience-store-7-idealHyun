class ConvenienceStoreController {
  #inputView
  #outputView

  constructor(inputView,outputView) {
    this.#inputView = inputView;
    this.#outputView = outputView;
  }

  run(){
    this.#outputView.printWelcomeMessage()
  }
}

export default ConvenienceStoreController;