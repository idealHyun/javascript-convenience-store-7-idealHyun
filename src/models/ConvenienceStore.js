import DocsLoader from './DocsLoader.js';
import Parser from './Parser.js';
import ProductStock from './ProductStock.js';
import { DOCS_CONFIG } from '../constants/docsConfig.js';
import { DateTimes } from '@woowacourse/mission-utils';
import { ERROR_MESSAGE } from '../constants/message.js';
import { STORE_CONFIG } from '../constants/storeConfig.js';
import Receipt from './Receipt.js';
import PurchasedProductDTO from '../dtos/PurchasedProductDTO.js';
import BonusProductDTO from '../dtos/BonusProductDTO.js';
import TotalInfoDTO from '../dtos/TotalInfoDTO.js';
import ReceiptDTO from '../dtos/ReceiptDTO.js';

class ConvenienceStore {
  #productMap;
  #promotionMap;
  #productStockMap;
  #receipt;

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
  }

  getProductList(){
    return Array.from(this.#productMap.keys());
  }

  createReceipt(){
    this.#receipt = new Receipt();
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

  getMaxPromotionQuantity(productStockToSell){
    const promotion = this.#getPromotionForProductName(productStockToSell.getProductName())
    if(promotion){
      const promotionProductCount = this.#productStockMap.get(productStockToSell.getProductName()).promotion.getQuantity()
      return promotion.calculateMaxPromotionQuantity(productStockToSell.getQuantity(),promotionProductCount);
    }
    return 0;
  }

  // 프로모션이 있는 상품의 재고를 감소시키는 메소드
  decrementPromotionProductQuantity(isExceed, productName, decrementQuantity){
    if(isExceed){
      // 프로모션 재고 감소
      const quantity = this.#getPromotionProductQuantity(this.#productStockMap.get(productName).promotion)
      this.#productStockMap.get(productName).promotion.decrementQuantity(quantity)
      // 일반 재고 감소
      this.#productStockMap.get(productName).noPromotion.decrementQuantity(decrementQuantity - quantity)
    }else{
      // 프로모션 재고만 감소
      this.#productStockMap.get(productName).promotion.decrementQuantity(decrementQuantity)
    }
  }

  // 일반 상품의 재고를 감소 시키는 메소드
  decrementProductQuantity(productName,decrementQuantity){
    this.#productStockMap.get(productName).noPromotion.decrementQuantity(decrementQuantity)
  }

  // 영수증에 프로모션이 적용된 상품 추가하기
  addAppliedPromotionProductToReceipt(productName,quantity){
    this.#receipt.addAppliedPromotionProduct({
      product : this.#productMap.get(productName),
      quantity : quantity
    });
  }

  // 영수증에 프로모션이 적용되지 않은 상품 추가하기
  addNotAppliedPromotionProductToReceipt(productName,quantity){
    this.#receipt.addNotAppliedPromotionProduct(
      {
        product : this.#productMap.get(productName),
        quantity : quantity
      }
    );
  }

  // 영수증에 증정 상품에 추가하기
  addBonusProductToReceipt(productName,quantity){
    this.#receipt.addBonusProduct(
      {
        product : this.#productMap.get(productName),
        quantity : quantity
      }
    );
  }

  getBonusProductCount(productName,purchaseQuantity){
    const promotion = this.#getPromotionForProductName(productName);
    return promotion.calculateBonusCount(purchaseQuantity);
  }

  getPromotionSetSize(productName){
    const promotion = this.#getPromotionForProductName(productName);
    return promotion.calculatePromotionSetSize();
  }

  calculatePurchaseRecord(applyDiscount) {

    const purchasedProductList = this.#receipt.getTotalProductsQuantity();

    const purchasedProductDTOs = Object.entries(purchasedProductList).map(([name, { quantity, price }]) => {
      return new PurchasedProductDTO(name, quantity, price * quantity);
    });

    const bonusProductList = this.#receipt.getBonusProduct();
    const bonusProductDTOs = Object.entries(bonusProductList).map(([name, { quantity }]) => {
      return new BonusProductDTO(name, quantity);
    });

    const totalPurchaseAmount = this.#receipt.getTotalPurchaseAmount();
    const promotionDiscount = this.#receipt.getTotalPromotionDiscount();
    const membershipDiscount = applyDiscount ? this.#receipt.getMembershipDiscountAmount() : 0;
    const finalAmount = totalPurchaseAmount - promotionDiscount - membershipDiscount;

    const totalInfoDTO = new TotalInfoDTO(
      this.#receipt.getTotalQuantity(),
      totalPurchaseAmount,
      promotionDiscount,
      membershipDiscount,
      finalAmount
    );

    return new ReceiptDTO(purchasedProductDTOs, bonusProductDTOs, totalInfoDTO);
  }

  #getPromotionForProductName(productName){
    if ( this.#productStockMap.get(productName).promotion){
      return this.#promotionMap.get(this.#productStockMap.get(productName).promotion.getPromotionName());
    }
    return null;
  }

  #validateProductName(productName){
    this.#checkProductName(this.getProductList(),productName)
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
