import ProductStock from './ProductStock.js';
import PromotionProductStock from './PromotionProductStock.js';
import Product from './Product.js';
import Promotion from './Promotion.js';

class Parser {
  parsePromotionsData(fileData) {
    const { headers, dataLines } = this.#extractHeadersAndDataLines(fileData);
    const promotionMap = new Map();

    dataLines.forEach(line => {
      const values = this.#splitAndTrim(line, ',');
      const { name, ...otherData } = this.#mapValuesToObject(headers, values);
      promotionMap.set(name, this.#createPromotion(name, otherData));
    });

    return promotionMap;
  }

  #createPromotion(name, { buy, get, startDate, endDate }) {
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

  #processDataLine(line, headers, productMap, productStockMap) {
    const values = this.#splitAndTrim(line, ',');
    const productData = this.#mapValuesToObject(headers, values);

    this.#addProductToMap(productMap, productData);
    this.#addProductStockToMap(productStockMap, productData);
  }

  #addProductToMap(productMap, { name, price }) {
    if (!productMap.has(name)) {
      const product = new Product(name, price);
      productMap.set(name, product);
    }
  }

  #addProductStockToMap(productStockMap, { name, quantity, promotion }) {
    const stockEntry = productStockMap.get(name) || {
      promotion: null,
      noPromotion: null,
    };

    if (promotion && promotion.toLowerCase() !== 'null') {
      stockEntry.promotion = new PromotionProductStock(
        name,
        quantity,
        promotion,
      );
    } else {
      stockEntry.noPromotion = new ProductStock(name, quantity);
    }

    productStockMap.set(name, stockEntry);
  }

  #extractHeadersAndDataLines(fileData) {
    const [headerLine, ...dataLines] = this.#splitAndTrim(fileData, '\n');
    const headers = this.#splitAndTrim(headerLine, ',');
    return { headers, dataLines };
  }

  #mapValuesToObject(headers, values) {
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] === 'null' ? null : values[index];
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
