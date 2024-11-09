import Parser from '../src/models/Parser.js';
import DocsLoader from '../src/models/DocsLoader.js';
import { DOCS_CONFIG } from '../src/constants/docsConfig.js';
import Promotion from '../src/models/Promotion.js';

describe('Parser 테스트', () => {
  test('파싱', async () => {
    const promotionData = await DocsLoader.loadDocs(
      DOCS_CONFIG.promotionsFilePath,
    );
    const parser = new Parser();
    const parsedData = parser.parsePromotionsData(promotionData);

    const expectedData = new Map([
      [
        '탄산2+1',
        new Promotion('탄산2+1', 2, 1, '2024-01-01', '2024-12-31')
      ],
      [
        'MD추천상품',
        new Promotion('MD추천상품', 1, 1, '2024-01-01', '2024-12-31')
      ],
      [
        '반짝할인',
        new Promotion('반짝할인', 1, 1, '2024-11-01', '2024-11-30')
      ]
    ]);

    expect(parsedData).toEqual(expectedData);
  });
});
