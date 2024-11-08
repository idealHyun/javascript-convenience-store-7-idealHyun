import path from 'path';

const DOCS_CONFIG = {
  PRODUCTS_FILE_PATH: path.resolve(process.cwd(), 'public/products.md'),
  PROMOTIONS_FILE_PATH: path.resolve(process.cwd(), 'public/promotions.md'),
};

export { DOCS_CONFIG };
