import Parser from '../src/models/Parser.js';
import DocsLoader from '../src/models/DocsLoader.js';
import { DOCS_CONFIG } from '../src/constants/docsConfig.js';

describe('Parser 테스트', () => {
  test('파싱', async () => {
    const promotionData = await DocsLoader.loadDocs(
      DOCS_CONFIG.PROMOTIONS_FILE_PATH,
    );
    const parser = new Parser();
    const parsedData = parser.parsePromotionsData(promotionData);

    expect(parsedData).toEqual({
      '탄산2+1': {
        name: '탄산2+1',
        buy: 2,
        get: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      },
      MD추천상품: {
        name: 'MD추천상품',
        buy: 1,
        get: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      },
      반짝할인: {
        name: '반짝할인',
        buy: 1,
        get: 1,
        startDate: '2024-11-01',
        endDate: '2024-11-30',
      },
    });
  });
});
