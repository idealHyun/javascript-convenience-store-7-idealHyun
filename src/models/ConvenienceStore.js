import DocsLoader from './DocsLoader.js';
import { DOCS_CONFIG } from '../constants/docsConfig.js';
import Parser from './Parser.js';
import { DateTimes } from '@woowacourse/mission-utils';

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

  getProductInfo(productName){
    const price = this.#productMap.get(productName).getPrice();
    const generalProductStock = this.#productStockMap.get(productName);

    const productQuantity = this.#getProductQuantity(generalProductStock.noPromotion);
    const promotionProductQuantity = this.#getPromotionProductQuantity(generalProductStock.promotion);
    const promotionName = this.#getPromotionName(generalProductStock.promotion);

    return { productName, price, productQuantity, promotionProductQuantity, promotionName };
  }

  #getPromotionProductQuantity(promotionProductStock){
    if (promotionProductStock === null || !this.#checkPromotionPeriod(promotionProductStock.getPromotionName(),DateTimes.now())){
      return null;
    }
    return promotionProductStock.getQuantity();
  }

  #getPromotionName(promotionProductStock){
    if (promotionProductStock === null){
      return null;
    }
    return promotionProductStock.getPromotionName();
  }

  #getProductQuantity(productStock){
    if (productStock === null){
      return null;
    }
    return productStock.getQuantity();
  }

  #checkPromotionPeriod(promotionName,today){
    return this.#promotionMap.get(promotionName).isOngoingPromotion(today);
  }

  async #loadPromotions() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.PROMOTIONS_FILE_PATH);
  }

  async #loadProducts() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.PRODUCTS_FILE_PATH);
  }
}

export default ConvenienceStore;
