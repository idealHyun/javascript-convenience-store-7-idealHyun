import path from 'path';

const DOCS_CONFIG = Object.freeze({
  productsFilePath: path.resolve(process.cwd(), 'public/products.md'),
  promotionsFilePath: path.resolve(process.cwd(), 'public/promotions.md'),
});

export { DOCS_CONFIG };
