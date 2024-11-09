import ConvenienceStoreController from './controllers/ConvenienceStoreController.js';
import InputView from './views/InputView.js';
import OutputView from './views/OutputView.js';
import ConvenienceStore from './models/ConvenienceStore.js';
import Receipt from './models/Receipt.js';

class App {
  async run() {
    const convenienceStore = new ConvenienceStore();
    const receipt = new Receipt();
    const inputView = new InputView();
    const outputView = new OutputView();
    const convenienceStoreController = new ConvenienceStoreController(
      convenienceStore,
      receipt,
      inputView,
      outputView,
    );
    await convenienceStoreController.run();
  }
}

export default App;
