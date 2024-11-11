import { Console } from '@woowacourse/mission-utils';
import { ERROR_MESSAGE } from '../src/constants/message.js';
import InputView from '../src/views/InputView.js';

describe('InputView 상품 수량 입력 형식에 대한 예외 테스트', () => {
  let inputView;

  beforeEach(() => {
    inputView = new InputView();
  });

  test.each([
    {
      description: '잘못된 형식의 입력값',
      input: '잘못된입력값',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '빈 값 입력',
      input: '',
      expectedErrorMessage: ERROR_MESSAGE.validation.blank,
    },
    {
      description: '이상한 특수 문자 포함',
      input: '[@Product-10]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '제품명 없이 숫자만 있는 입력값',
      input: '[123-10]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '제품명이 비어있는 형식',
      input: '[-10]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '수량이 음수인 입력값',
      input: '[Product--10]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '공백이 포함된 제품명',
      input: '[Product -10]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '콤마로 구분되지 않은 여러 제품',
      input: '[Product-10][Product-20]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '정상 형식이지만 제품 수량이 없는 입력값',
      input: '[Product-]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '닫는 대괄호 없는 경우',
      input: '[Product-',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
    {
      description: '여는 대괄호 없는 경우',
      input: 'Product-]',
      expectedErrorMessage: ERROR_MESSAGE.input.invalidFormat,
    },
  ])('$description', async ({ input, expectedErrorMessage }) => {
    const readLineSpy = jest
      .spyOn(Console, 'readLineAsync')
      .mockResolvedValue(input);

    await expect(inputView.getInputProductAndQuantity()).rejects.toThrow(
      expectedErrorMessage,
    );

    readLineSpy.mockRestore();
  });
});

describe('getInputYesOrNo 유효성 검증 테스트', () => {
  let inputView;

  beforeEach(() => {
    inputView = new InputView();
  });

  describe('정상적으로 동작하는 경우', () => {
    const validTestCases = [
      {
        description: '유효한 입력값 Y',
        input: 'Y',
        expectedOutput: true,
      },
      {
        description: '유효한 입력값 N',
        input: 'N',
        expectedOutput: false,
      },
    ];

    test.each(validTestCases)(
      '$description',
      async ({ input, expectedOutput }) => {
        const readLineSpy = jest
          .spyOn(Console, 'readLineAsync')
          .mockResolvedValue(input);

        const result = await inputView.getInputYesOrNo();
        expect(result).toBe(expectedOutput);

        readLineSpy.mockRestore();
      },
    );
  });

  describe('에러가 발생하는 경우', () => {
    const invalidTestCases = [
      {
        description: '소문자 y',
        input: 'y',
        expectedErrorMessage: ERROR_MESSAGE.input.invalidInput,
      },
      {
        description: '소문자 n',
        input: 'n',
        expectedErrorMessage: ERROR_MESSAGE.input.invalidInput,
      },
      {
        description: '공백 포함',
        input: ' Y ',
        expectedErrorMessage: ERROR_MESSAGE.input.invalidInput,
      },
      {
        description: '중복',
        input: 'YY',
        expectedErrorMessage: ERROR_MESSAGE.input.invalidInput,
      },
      {
        description: '빈 문자열',
        input: '',
        expectedErrorMessage: ERROR_MESSAGE.validation.blank,
      },
      {
        description: '공백',
        input: '  ',
        expectedErrorMessage: ERROR_MESSAGE.validation.blank,
      },
    ];

    test.each(invalidTestCases)(
      '$description',
      async ({ input, expectedErrorMessage }) => {
        const readLineSpy = jest
          .spyOn(Console, 'readLineAsync')
          .mockResolvedValue(input);

        await expect(inputView.getInputYesOrNo()).rejects.toThrow(
          expectedErrorMessage,
        );

        readLineSpy.mockRestore();
      },
    );
  });
});
