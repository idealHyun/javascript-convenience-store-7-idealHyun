import ConvenienceStoreController from './controllers/ConvenienceStoreController.js';
import InputView from './views/InputView.js';
import OutputView from './views/OutputView.js';
import ConvenienceStore from './models/ConvenienceStore.js';

class App {
  async run() {
    const convenienceStore = new ConvenienceStore();
    const inputView = new InputView();
    const outputView = new OutputView();
    const convenienceStoreController = new ConvenienceStoreController(
      convenienceStore,
      inputView,
      outputView,
    );
    await convenienceStoreController.run();
  }
}

export default App;
