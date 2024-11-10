import ProductStock from './ProductStock.js';
import PromotionProductStock from './PromotionProductStock.js';
import Product from './Product.js';
import Promotion from './Promotion.js';

class Parser {
  #REPLACE_REGEX = /[\[\]]/g;
  #NULL = 'null';
  #COMMA = ',';
  #BREAK_LINE = '\n';
  #BAR = '-';
  #SNAKE_CASE_START_DATE = 'start_date';
  #SNAKE_CASE_END_DATE = 'end_date';
  #CAMEL_CASE_START_DATE = 'startDate';
  #CAMEL_CASE_END_DATE = 'endDate';

  parsePromotionsData(fileData) {
    const { headers, dataLines } = this.#extractHeadersAndDataLines(fileData);
    const promotionMap = new Map();

    const CamelCaseHeaders = this.#convertToCamelCaseHeaders(headers);
    this.#processDataLines(dataLines, CamelCaseHeaders, promotionMap);

    return promotionMap;
  }

  #convertToCamelCaseHeaders(headers) {
    return headers.map((header) => {
      if (header === this.#SNAKE_CASE_START_DATE)
        return this.#CAMEL_CASE_START_DATE;
      if (header === this.#SNAKE_CASE_END_DATE)
        return this.#CAMEL_CASE_END_DATE;
      return header;
    });
  }

  #processDataLines(dataLines, headers, promotionMap) {
    dataLines.forEach((line) => {
      const values = this.#splitAndTrim(line, this.#COMMA);
      const productData = this.#mapValuesToObject(headers, values);

      promotionMap.set(
        productData.name,
        this.#createPromotion({ ...productData }),
      );
    });
  }

  #createPromotion({ name, buy, get, startDate, endDate }) {
    return new Promotion(name, buy, get, startDate, endDate);
  }

  parseProductData(fileData) {
    const { headers, dataLines } = this.#extractHeadersAndDataLines(fileData);

    const productMap = new Map();
    const productStockMap = new Map();

    dataLines.forEach((line) => {
      this.#processDataLine(line, headers, productMap, productStockMap);
    });
    return { productMap, productStockMap };
  }

  parseProductInfo(inputString) {
    return inputString.split(this.#COMMA).map((item) => {
      const [productName, quantityString] = item
        .replace(this.#REPLACE_REGEX, '')
        .split(this.#BAR);
      return { productName, quantityString };
    });
  }

  #processDataLine(line, headers, productMap, productStockMap) {
    const values = this.#splitAndTrim(line, this.#COMMA);
    const productData = this.#mapValuesToObject(headers, values);

    this.#addProductToMap(productMap, { ...productData });
    this.#addProductStockToMap(productStockMap, { ...productData });
  }

  #addProductToMap(productMap, { name, price }) {
    if (!productMap.has(name)) {
      const product = new Product(name, price);
      productMap.set(name, product);
    }
  }

  #addProductStockToMap(productStockMap, { name, quantity, promotion }) {
    const stockEntry =
      productStockMap.get(name) || this.#initializeStockEntry();

    if (this.#hasPromotion(promotion)) {
      this.#setPromotionStock(stockEntry, name, quantity, promotion);
    } else {
      this.#setNoPromotionStock(stockEntry, name, quantity);
    }

    productStockMap.set(name, stockEntry);
  }

  #initializeStockEntry() {
    return { promotion: null, noPromotion: null };
  }

  #hasPromotion(promotion) {
    return promotion && promotion.toLowerCase() !== this.#NULL;
  }

  #setPromotionStock(stockEntry, name, quantity, promotion) {
    stockEntry.promotion = new PromotionProductStock(name, quantity, promotion);
  }

  #setNoPromotionStock(stockEntry, name, quantity) {
    stockEntry.noPromotion = new ProductStock(name, quantity);
  }

  #extractHeadersAndDataLines(fileData) {
    const [headerLine, ...dataLines] = this.#splitAndTrim(
      fileData,
      this.#BREAK_LINE,
    );
    const headers = this.#splitAndTrim(headerLine, this.#COMMA);
    return { headers, dataLines };
  }

  #mapValuesToObject(headers, values) {
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] === this.#NULL ? null : values[index];
      return obj;
    }, {});
  }

  #splitAndTrim(string, delimiter) {
    return string
      .trim()
      .split(delimiter)
      .map((item) => item.trim());
  }
}

export default Parser;
