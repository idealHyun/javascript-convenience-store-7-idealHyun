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
    this.#promotionMap = parser.parsePromotionsData(await this.#loadPromotions());
    const { productMap, productStockMap } = parser.parseProductData(await this.#loadProducts());
    this.#productMap = productMap;
    this.#productStockMap = productStockMap;
  }

  getProductList() {
    return Array.from(this.#productMap.keys());
  }

  createReceipt() {
    this.#receipt = new Receipt();
  }

  getProductInfo(productName) {
    const product = this.#productMap.get(productName);
    const { noPromotion, promotion } = this.#productStockMap.get(productName);

    return {
      productName,
      price: product.getPrice(),
      productQuantity: this.#getQuantity(noPromotion),
      promotionProductQuantity: this.#getQuantity(promotion, true),
      promotionName: this.#getPromotionName(promotion),
    };
  }

  getProductStocksToSell(inputString) {
    const parser = new Parser();
    const parsedItems = parser.parseProductInfo(inputString);

    return parsedItems.map(({ productName, quantityString }) => {
      this.#validateProductName(productName);
      this.#validateQuantity(productName, quantityString);
      return new ProductStock(productName, Number(quantityString));
    });
  }

  getPromotionProductQuantity(productName) {
    if(this.#productStockMap.get(productName).promotion){
      return this.#productStockMap.get(productName).promotion.getQuantity();
    }
    return 0;
  }

  isHavePromotion(productName){
    return !!this.#productStockMap.get(productName).promotion;
  }

  isExceedPromotionStock(productStock) {
    const promotion = this.#productStockMap.get(productStock.getProductName()).promotion;
    return promotion ? productStock.getQuantity() >= promotion.getQuantity() : false;
  }

  getMaxPromotionQuantity(productStockToSell) {
    const promotion = this.#getPromotionForProductName(productStockToSell.getProductName());
    if (promotion && promotion.isOngoingPromotion(DateTimes.now())) {
      const promotionProductCount = this.#getQuantity(this.#productStockMap.get(productStockToSell.getProductName()).promotion);
      return promotion.calculateMaxPromotionQuantity(productStockToSell.getQuantity(), promotionProductCount);
    }
    return 0;
  }

  decrementPromotionProductQuantity(isExceed, productName, decrementQuantity) {
    const promotionStock = this.#productStockMap.get(productName).promotion;
    const noPromotionStock = this.#productStockMap.get(productName).noPromotion;

    if (isExceed) {
      const quantity = this.#getQuantity(promotionStock);
      promotionStock.decrementQuantity(quantity);
      if(noPromotionStock){
        noPromotionStock.decrementQuantity(decrementQuantity - quantity);
      }
    } else {
      promotionStock.decrementQuantity(decrementQuantity);
    }
  }

  decrementProductQuantity(productName, decrementQuantity) {
    this.#productStockMap.get(productName).noPromotion.decrementQuantity(decrementQuantity);
  }

  addAppliedPromotionProductToReceipt(productName, quantity) {
    this.#receipt.addAppliedPromotionProduct({
      product: this.#productMap.get(productName),
      quantity: quantity,
    });
  }

  addNotAppliedPromotionProductToReceipt(productName, quantity) {
    this.#receipt.addNotAppliedPromotionProduct({
      product: this.#productMap.get(productName),
      quantity: quantity,
    });
  }

  addBonusProductToReceipt(productName, quantity) {
    this.#receipt.addBonusProduct({
      product: this.#productMap.get(productName),
      quantity: quantity,
    });
  }

  getBonusProductCount(productName, purchaseQuantity) {
    const promotion = this.#getPromotionForProductName(productName);
    return promotion.calculateBonusCount(purchaseQuantity);
  }

  getPromotionSetSize(productName) {
    const promotion = this.#getPromotionForProductName(productName);
    return promotion.calculatePromotionSetSize();
  }

  calculatePurchaseRecord(applyDiscount) {
    return new ReceiptDTO(
      this.#createPurchasedProductDTOs(),
      this.#createBonusProductDTOs(),
      new TotalInfoDTO(
        this.#receipt.getTotalQuantity(),
        ...Object.values(this.#calculateTotalAmounts(applyDiscount))
      )
    );
  }

  #calculateTotalAmounts(applyDiscount) {
    const totalPurchaseAmount = this.#receipt.getTotalPurchaseAmount();
    const promotionDiscount = this.#receipt.getTotalPromotionDiscount();
    const membershipDiscount = applyDiscount ? this.#receipt.getMembershipDiscountAmount() : 0;
    const finalAmount = totalPurchaseAmount - promotionDiscount - membershipDiscount;

    return { totalPurchaseAmount, promotionDiscount, membershipDiscount, finalAmount };
  }

  #createPurchasedProductDTOs() {
    const purchasedProductList = this.#receipt.getTotalProductsQuantity();
    return Object.entries(purchasedProductList).map(([name, { quantity, price }]) =>
      new PurchasedProductDTO(name, quantity, price * quantity)
    );
  }

  #createBonusProductDTOs() {
    const bonusProductList = this.#receipt.getBonusProduct();
    return Object.entries(bonusProductList).map(([name, { quantity }]) =>
      new BonusProductDTO(name, quantity)
    );
  }

  #getPromotionForProductName(productName) {
    const promotionName = this.#getPromotionName(this.#productStockMap.get(productName).promotion);
    return promotionName ? this.#promotionMap.get(promotionName) : null;
  }

  #validateProductName(productName) {
    if (!this.getProductList().includes(productName)) {
      throw new Error(ERROR_MESSAGE.input.invalidProduct);
    }
  }

  #validateQuantity(productName, quantityString) {
    const quantity = Number(quantityString);
    if (isNaN(quantity) || quantity < STORE_CONFIG.minimumProductQuantity) {
      throw new Error(ERROR_MESSAGE.validation.invalidQuantity);
    }
    if (quantity > this.#getTotalQuantity(productName)) {
      throw new Error(ERROR_MESSAGE.input.invalidQuantity);
    }
  }


  #getTotalQuantity(productName) {
    const { noPromotion, promotion } = this.#productStockMap.get(productName);
    return (this.#getQuantity(noPromotion) || 0) + (this.#getQuantity(promotion, true) || 0);
  }

  #getQuantity(productStock, checkPromotionPeriod = false) {
    if (!productStock) return 0;
    if (checkPromotionPeriod && !this.#isPromotionValid(productStock.getPromotionName())) return 0;
    return productStock.getQuantity();
  }

  #getPromotionName(promotionProductStock) {
    return promotionProductStock ? promotionProductStock.getPromotionName() : null;
  }

  #isPromotionValid(promotionName) {
    return promotionName && this.#promotionMap.get(promotionName).isOngoingPromotion(DateTimes.now());
  }

  async #loadPromotions() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.promotionsFilePath);
  }

  async #loadProducts() {
    return await DocsLoader.loadDocs(DOCS_CONFIG.productsFilePath);
  }
}

export default ConvenienceStore;
