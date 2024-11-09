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

    // TODO: 프로모션 재고 먼저 차감하기
    productStocksToSell.forEach((productStock) => {
      // productStock 에서 물건 이름 꺼내서
      const productName = productStock.getProductName();

      // Map 에서 promotion 정보에서 buy,get 꺼내서 현재 물건 개수로 프로모션 잘 이루어지는지 확인
      const promotion = this.#promotionMap.get(productName);
      promotion.calculateBonusQuantity(productStock.getQuantity());

      // 확인결과, 해당 수량만큼 안가져오면 메세지 띄우기

      // 프로모션 재고가 수량 넘긴 경우 일부 수량 정가 결제 메세지 띄우기
      // 정가 결제 안할시 그만큼 수량 빼기

      // 멤버십 할인 적용 여부 띄우기

      // 총 판매 정보 리턴하기
    })
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
