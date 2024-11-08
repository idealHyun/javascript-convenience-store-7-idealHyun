import { Console } from '@woowacourse/mission-utils';
import { SYSTEM_MESSAGE } from '../constants/message.js';

class OutputView {
  printWelcomeMessage() {
    Console.print(SYSTEM_MESSAGE.OUTPUT.WELCOME)
  }
}


export default OutputView;