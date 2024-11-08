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

  #extractHeadersAndDataLines(fileData) {
    const [headerLine, ...dataLines] = this.#splitAndTrim(fileData, '\n');
    const headers = this.#splitAndTrim(headerLine, ',');
    return { headers, dataLines };
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
    return string.trim().split(delimiter).map(item => item.trim());
  }
}

export default Parser;
