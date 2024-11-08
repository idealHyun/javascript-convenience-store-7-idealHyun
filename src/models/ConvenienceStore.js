import DocsLoader from './DocsLoader.js';
import { DOCS_CONFIG } from '../constants/docsConfig.js';
import Parser from './Parser.js';

class ConvenienceStore {
  #productMap;
  #promotionMap;
  #productStockMap;

  async loadInitData() {
    const parser = new Parser();
    this.#promotionMap = parser.parsePromotionsData(
      await this.#loadPromotions(),
    );
    const { productMap, productStockMap } = parser.parseProductData(
      await this.#loadProducts(),
    );
    this.#productMap = productMap;
    this.#productStockMap = productStockMap;

    return Array.from(this.#productMap.keys());
  }

  async #loadPromotions() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.PROMOTIONS_FILE_PATH);
  }

  async #loadProducts() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.PRODUCTS_FILE_PATH);
  }
}

export default ConvenienceStore;
