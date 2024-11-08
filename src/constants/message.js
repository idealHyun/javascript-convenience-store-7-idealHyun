const SYSTEM_MESSAGE = Object.freeze({
  INPUT: {
    INVALID_FORMAT: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    INVALID_PRODUCT: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    INVALID_QUANTITY: '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
    INVALID_INPUT: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
  },
  OUTPUT: {
    WELCOME: '안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n',
  },
});


const ERROR_MESSAGE={
  FILE: {
    INVALID_LOAD: '[ERROR] 파일을 로드하는 데 실패했습니다.',
  },
}

export { SYSTEM_MESSAGE, ERROR_MESSAGE };

