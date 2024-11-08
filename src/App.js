import ConvenienceStoreController from './controllers/ConvenienceStoreController.js';
import InputView from './views/InputView.js';
import OutputView from './views/OutputView.js';

class App {
  async run() {
    const inputView = new InputView();
    const outputView = new OutputView();
    const convenienceStoreController = new ConvenienceStoreController(inputView,outputView);
    convenienceStoreController.run();
  }
}

export default App;
