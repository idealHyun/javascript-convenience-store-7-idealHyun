import DocsLoader from './DocsLoader.js';
import { DOCS_CONFIG } from '../constants/docsConfig.js';

class ConvenienceStore {
  #productMap
  #promotionMap
  #productStockMap

  async loadInitData(){
    await this.#loadData();
  }

  async #loadData(){
    const promotions = await this.#loadPromotions()
    const products = await this.#loadProducts()

    // 파싱해서 저장하기
  }
  async #loadPromotions() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.PROMOTIONS_FILE_PATH)
  }

  async #loadProducts() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.PRODUCTS_FILE_PATH)
  }
}

export default ConvenienceStore;