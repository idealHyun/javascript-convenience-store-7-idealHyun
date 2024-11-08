import ProductStock from './ProductStock.js';
import PromotionProductStock from './PromotionProductStock.js';
import Product from './Product.js';

class Parser {
  parsePromotionsData(fileData) {
    const { headers, dataLines } = this.#extractHeadersAndDataLines(fileData);

    return dataLines.reduce((promotions, line) => {
      const values = this.#splitAndTrim(line, ',');
      const promotion = this.#createPromotionObject(headers, values);

      promotions[promotion.name] = promotion;
      return promotions;
    }, {});
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

  #createPromotionObject(headers, values) {
    return headers.reduce((promotion, header, index) => {
      const key = header;
      const value = this.#parseValue(key, values[index]);
      promotion[key] = value;
      return promotion;
    }, {});
  }

  #parseValue(key, value) {
    if (key === 'buy' || key === 'get') {
      return parseInt(value, 10);
    }
    return value;
  }

  #splitAndTrim(string, delimiter) {
    return string
      .trim()
      .split(delimiter)
      .map((item) => item.trim());
  }
}

export default Parser;
