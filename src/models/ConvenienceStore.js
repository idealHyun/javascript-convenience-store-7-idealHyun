import DocsLoader from './DocsLoader.js';
import { DOCS_CONFIG } from '../constants/docsConfig.js';
import Parser from './Parser.js';
import { DateTimes } from '@woowacourse/mission-utils';
import ProductStock from './ProductStock.js';
import { ERROR_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';

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

    return this.#getProductList();
  }

  getProductInfo(productName){
    const price = this.#productMap.get(productName).getPrice();
    const totalProductStock = this.#productStockMap.get(productName);

    const productQuantity = this.#getProductQuantity(totalProductStock.noPromotion);
    const promotionProductQuantity = this.#getPromotionProductQuantity(totalProductStock.promotion);
    const promotionName = this.#getPromotionName(totalProductStock.promotion);

    return { productName, price, productQuantity, promotionProductQuantity, promotionName };
  }

  sell(InputString){
    const productStocksToSell = InputString.split(',').map(item => {
      const [productName, quantityString] = item.replace(/[\[\]]/g, '').split('-');
      this.#validateProductName(productName);
      this.#validateQuantity(productName,quantityString);

      return new ProductStock(productName,Number(quantityString));
    });
  }

  #validateProductName(productName){
    this.#checkProductName(this.#getProductList(),productName)
  }

  #validateQuantity(productName,quantityString){
    this.#checkTypeNumber(quantityString)
    this.#checkQuantityRange(Number(quantityString))
    this.#checkOverQuantity(this.#getTotalQuantity(productName),Number(quantityString))
  }

  #checkProductName(productList,value){
    if(!productList.includes(value)){
      throw new Error(ERROR_MESSAGE.INPUT.INVALID_PRODUCT);
    }
  }

  #checkTypeNumber(value) {
    if (isNaN(Number(value))) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_NUMBER);
    }
  }

  #checkQuantityRange(value) {
    if (value < STORE_CONFIG.MINIMUM_PRODUCT_QUANTITY) {
      throw new Error(ERROR_MESSAGE.VALIDATION.INVALID_QUANTITY);
    }
  }

  #checkOverQuantity(totalQuantity, value){
    if(value > totalQuantity){
      throw new Error(ERROR_MESSAGE.INPUT.INVALID_QUANTITY);
    }
  }

  #getTotalQuantity(productName){
    const totalProductStock = this.#productStockMap.get(productName);
    const productQuantity = this.#getProductQuantity(totalProductStock.noPromotion);
    const promotionProductQuantity = this.#getPromotionProductQuantity(totalProductStock.promotion);

    return productQuantity + promotionProductQuantity;
  }

  #getProductList(){
    return Array.from(this.#productMap.keys());
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
