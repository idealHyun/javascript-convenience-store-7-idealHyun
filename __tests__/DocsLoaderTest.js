import { DOCS_CONFIG } from '../src/constants/docsConfig.js';
import DocsLoader from '../src/models/DocsLoader.js';

describe('DocsLoader 테스트', () => {

  test('promotions 테스트', async () => {
    await expect(DocsLoader.loadDocs(`${DOCS_CONFIG.PROMOTIONS_FILE_PATH}`)).resolves.not.toThrow();
  });

  test('products 테스트', async () => {
    await expect(DocsLoader.loadDocs(`${DOCS_CONFIG.PRODUCTS_FILE_PATH}`)).resolves.not.toThrow();
  });

  test('경로에 없는 파일 테스트',async ()=>{
    const PATH = './public/hello.md'
    await expect(DocsLoader.loadDocs(`${PATH}`)).rejects.toThrow();
  })
})