import fs from 'fs/promises';
import { ERROR_MESSAGE } from '../constants/message.js';

class DocsLoader {
  static async loadDocs(path) {
    try {
      return await fs.readFile(path, 'utf8');
    } catch {
      throw new Error(ERROR_MESSAGE.file.invalidLoad);
    }
  }
}

export default DocsLoader;
