import DocsLoader from './DocsLoader.js';
import Parser from './Parser.js';
import ProductStock from './ProductStock.js';
import { DOCS_CONFIG } from '../constants/docsConfig.js';
import { DateTimes } from '@woowacourse/mission-utils';
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

  getProductStocksToSell(InputString){
    return InputString.split(',').map(item => {
      const [productName, quantityString] = item.replace(/[\[\]]/g, '').split('-');
      this.#validateProductName(productName);
      this.#validateQuantity(productName,quantityString);

      return new ProductStock(productName,Number(quantityString));
    });
  }

  isExceedPromotionStock(productStock){
    if( this.#productStockMap.get(productStock.getProductName()).promotion ){
      return productStock.getQuantity() > this.#productStockMap.get(productStock.getProductName()).promotion.getQuantity();
    }
    return false;
  }

  getExceedCount(productStock){
    return productStock.getQuantity() - this.#productStockMap.get(productStock.getProductName()).promotion.getQuantity()
  }

  getMaxPromotionQuantity(productStock){
    const promotion = this.#getPromotionForProductName(productStock.getProductName())
    if(promotion){
      return promotion.calculateMaxPromotionQuantity(productStock.getQuantity());
    }
    return 0;
  }

  #getPromotionForProductName(productName){
    if ( this.#productStockMap.get(productName).promotion){
      return this.#promotionMap.get(this.#productStockMap.get(productName).promotion.getPromotionName());
    }
    return null;
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
      throw new Error(ERROR_MESSAGE.input.invalidProduct);
    }
  }

  #checkTypeNumber(value) {
    if (isNaN(Number(value))) {
      throw new Error(ERROR_MESSAGE.validation.invalidNumber);
    }
  }

  #checkQuantityRange(value) {
    if (value < STORE_CONFIG.minimumProductQuantity) {
      throw new Error(ERROR_MESSAGE.validation.invalidQuantity);
    }
  }

  #checkOverQuantity(totalQuantity, value){
    if(value > totalQuantity){
      throw new Error(ERROR_MESSAGE.input.invalidQuantity);
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
    return await DocsLoader.loadDocs(DOCS_CONFIG.promotionsFilePath);
  }

  async #loadProducts() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.productsFilePath);
  }
}

export default ConvenienceStore;
