import { STORE_CONFIG } from './storeConfig.js';

const SYSTEM_MESSAGE = Object.freeze({
  INPUT : {
    REQUEST_PRODUCT_AND_QUANTITY : '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
    REQUEST_MEMBERSHIP_DISCOUNT : '\n멤버십 할인을 받으시겠습니까? (Y/N)'
  },
  OUTPUT: {
    WELCOME: '안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n',
  },
});

const ERROR_MESSAGE = Object.freeze({
  FILE: {
    INVALID_LOAD: '[ERROR] 파일을 로드하는 데 실패했습니다.',
  },
  VALIDATION: {
    NOT_PROVIDED: '[ERROR] 유효하지 않은 값(null, undefined)이 들어있습니다.',
    INVALID_NUMBER: '[ERROR] 값의 형태가 숫자가 아닙니다.',
    INVALID_INTEGER: '[ERROR] 값의 형태가 정수가 아닙니다.',
    INVALID_DATE: '[ERROR] 값의 형태가 날짜가 아닙니다.',
    BLANK: '[ERROR] 값에 공백이 들어왔습니다.',
    INVALID_PERIOD: '[ERROR] 끝나는 날짜가 시작 날짜보다 빠를 수 없습니다.',
    INVALID_STRING: '[ERROR] 값의 형태가 문자열이 아닙니다.',
    INVALID_BUY_RANGE: '[ERROR] 값이 최소 구매 개수를 넘겨야합니다.',
    INVALID_GET_RANGE: '[ERROR] 값이 최소 받는 개수를 넘겨야합니다.',
    INVALID_PRICE: `[ERROR] 금액은 최소 금액인 ${STORE_CONFIG.MINIMUM_PRICE} 이상 이어야합니다.`,
    INVALID_QUANTITY: `[ERROR] 물건의 수량은 ${STORE_CONFIG.MINIMUM_PRODUCT_QUANTITY} 이상 이어야합니다.`,
  },
  INPUT: {
    INVALID_FORMAT:
      '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    INVALID_PRODUCT: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    INVALID_QUANTITY:
      '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
    INVALID_INPUT: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
  },
});

const EXCEED_QUANTITY_MESSAGE = (productName, quantity) =>
  `\n현재 ${productName} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)`;

const PROMOTION_GUIDE_MESSAGE = (productName, quantity) =>
  `\n현재 ${productName}은(는) ${quantity}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)`;

export { SYSTEM_MESSAGE, ERROR_MESSAGE,EXCEED_QUANTITY_MESSAGE,PROMOTION_GUIDE_MESSAGE };
