import App from '../src/App.js';
import { MissionUtils } from '@woowacourse/mission-utils';
import { EOL as LINE_SEPARATOR } from 'os';

const mockQuestions = (inputs) => {
  const messages = [];

  MissionUtils.Console.readLineAsync = jest.fn((prompt) => {
    messages.push(prompt);
    const input = inputs.shift();

    if (input === undefined) {
      throw new Error('NO INPUT');
    }

    return Promise.resolve(input);
  });

  MissionUtils.Console.readLineAsync.messages = messages;
};

const mockNowDate = (date = null) => {
  const mockDateTimes = jest.spyOn(MissionUtils.DateTimes, 'now');
  mockDateTimes.mockReturnValue(new Date(date));
  return mockDateTimes;
};

const getLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, 'print');
  logSpy.mockClear();
  return logSpy;
};

const getOutput = (logSpy) => {
  return [...logSpy.mock.calls].join(LINE_SEPARATOR);
};

const expectLogContains = (received, expects) => {
  expects.forEach((exp) => {
    expect(received).toContain(exp);
  });
};

const expectLogContainsWithoutSpacesAndEquals = (received, expects) => {
  const processedReceived = received.replace(/[\s=]/g, '');
  expects.forEach((exp) => {
    expect(processedReceived).toContain(exp);
  });
};

const runExceptions = async ({
  inputs = [],
  inputsToTerminate = [],
  expectedErrorMessage = '',
}) => {
  // given
  const logSpy = getLogSpy();
  mockQuestions([...inputs, ...inputsToTerminate]);

  // when
  const app = new App();
  await app.run();

  // then
  expect(logSpy).toHaveBeenCalledWith(
    expect.stringContaining(expectedErrorMessage),
  );
};

const run = async ({
  inputs = [],
  inputsToTerminate = [],
  expected = [],
  expectedIgnoringWhiteSpaces = [],
}) => {
  // given
  const logSpy = getLogSpy();
  mockQuestions([...inputs, ...inputsToTerminate]);

  // when
  const app = new App();
  await app.run();

  const output = getOutput(logSpy);

  // then
  if (expectedIgnoringWhiteSpaces.length > 0) {
    expectLogContainsWithoutSpacesAndEquals(
      output,
      expectedIgnoringWhiteSpaces,
    );
  }
  if (expected.length > 0) {
    expectLogContains(output, expected);
  }
};

const INPUTS_TO_TERMINATE = ['[비타민워터-1]', 'N', 'N'];

describe('편의점', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('파일에 있는 상품 목록 출력', async () => {
    await run({
      inputs: ['[콜라-1]', 'N', 'N'],
      expected: [
        /* prettier-ignore */
        "- 콜라 1,000원 10개 탄산2+1",
        '- 콜라 1,000원 10개',
        '- 사이다 1,000원 8개 탄산2+1',
        '- 사이다 1,000원 7개',
        '- 오렌지주스 1,800원 9개 MD추천상품',
        '- 오렌지주스 1,800원 재고 없음',
        '- 탄산수 1,200원 5개 탄산2+1',
        '- 탄산수 1,200원 재고 없음',
        '- 물 500원 10개',
        '- 비타민워터 1,500원 6개',
        '- 감자칩 1,500원 5개 반짝할인',
        '- 감자칩 1,500원 5개',
        '- 초코바 1,200원 5개 MD추천상품',
        '- 초코바 1,200원 5개',
        '- 에너지바 2,000원 5개',
        '- 정식도시락 6,400원 8개',
        '- 컵라면 1,700원 1개 MD추천상품',
        '- 컵라면 1,700원 10개',
      ],
    });
  });

  test('여러 개의 일반 상품 구매', async () => {
    await run({
      inputs: ['[비타민워터-3],[물-2],[정식도시락-2]', 'N', 'N'],
      expectedIgnoringWhiteSpaces: ['내실돈18,300'],
    });
  });

  test('기간에 해당하지 않는 프로모션 적용', async () => {
    mockNowDate('2024-02-01');

    await run({
      inputs: ['[감자칩-2]', 'N', 'N'],
      expectedIgnoringWhiteSpaces: ['내실돈3,000'],
    });
  });

  test('예외 테스트', async () => {
    await runExceptions({
      inputs: ['[컵라면-12]', 'N', 'N'],
      inputsToTerminate: INPUTS_TO_TERMINATE,
      expectedErrorMessage:
        '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
    });
  });
});

describe('상품 구매에 따른 안내 문구 테스트', () => {
  test.each([
    {
      description: '프로모션 적용되었으므로 안내 없음',
      inputs: ['[콜라-6]', 'N', 'N'],
    },
    {
      description: '이름 중복 작성시 프로모션 적용',
      inputs: ['[콜라-1],[콜라-1],[콜라-1]', 'N', 'N'],
    },
    {
      description: '프로모션 적용 조건 안되므로 안내 없음',
      inputs: ['[콜라-1]', 'N', 'N'],
    },
    {
      description: '프로모션 적용 하고 남은 개수는 조건 안되므로 안내 없음',
      inputs: ['[콜라-4]', 'N', 'N'],
    },
    {
      description: '프로모션 안내 메세지',
      inputs: ['[콜라-2]', 'N', 'N', 'N'],
      expected: [
        '현재 콜라은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)',
      ],
    },
    {
      description: '프로모션 적용하고 남은 개수 프로모션 안내 메세지',
      inputs: ['[콜라-5]', 'N', 'N', 'N'],
      expected: [
        '현재 콜라은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)',
      ],
    },
    {
      description:
        '프로모션 재고는 충분하지만 프로모션 적용을 하지 못해 정가 결제 메세지',
      inputs: ['[콜라-10]', 'Y', 'N', 'N'],
      expected: [
        '현재 콜라 1개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)',
      ],
    },
    {
      description: '프로모션 재고 부족으로 인한 정가 결제 메세지',
      inputs: ['[컵라면-10]', 'Y', 'N', 'N'],
      expected: [
        '현재 컵라면 10개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)',
      ],
    },
    {
      description:
        '이름 중복 작성으로 프로모션 재고 부족으로 인한 정가 결제 메세지',
      inputs: ['[컵라면-5],[컵라면-5]', 'Y', 'N', 'N'],
      expected: [
        '현재 컵라면 10개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)',
      ],
    },
    {
      description: '이름 중복 작성시 프로모션 안내 메세지',
      inputs: ['[콜라-1],[콜라-1]', 'Y', 'N', 'N'],
      expected: [
        '현재 콜라은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)',
      ],
    },
  ])('$description', async ({ inputs, expected }) => {
    await run({
      inputs,
      expected,
    });
  });
});

describe('프로모션 적용에 따른 멤버십 할인 테스트', () => {
  test.each([
    {
      description: '프로모션 혜택 받고 멤버십 할인 받는지 확인',
      inputs: ['[콜라-2]', 'Y', 'Y', 'N'],
      expectedIgnoringWhiteSpaces: ['멤버십할인-0'],
    },
    {
      description: '프로모션 혜택 안 받고 멤버십 할인 받는지 확인',
      inputs: ['[콜라-2]', 'N', 'Y', 'N'],
      expectedIgnoringWhiteSpaces: ['멤버십할인-600'],
    },
    {
      description: '프로모션 받은 후 멤버십 할인 받는지 확인',
      inputs: ['[콜라-3]', 'Y', 'N'],
      expectedIgnoringWhiteSpaces: ['멤버십할인-0'],
    },
    {
      description:
        '프로모션 초과하여 정가 결제 구매 후 멤버십 할인 받는지 확인',
      inputs: ['[콜라-20]', 'Y', 'Y', 'N'],
      expectedIgnoringWhiteSpaces: ['멤버십할인-3,300'],
    },
    {
      description:
        '프로모션 초과하여 정가 결제 하지 않고 멤버십 할인 받는지 확인',
      inputs: ['[콜라-20]', 'N', 'Y', 'N'],
      expectedIgnoringWhiteSpaces: ['멤버십할인-0'],
    },
    {
      description:
        '멤버십 할인 최대치가 8000인지 확인',
      inputs: ['[정식도시락-8],[비타민워터-5],[에너지바-5]', 'Y', 'N'],
      expectedIgnoringWhiteSpaces: ['멤버십할인-8,000'],
    },
  ])('$description', async ({ inputs, expected }) => {
    await run({
      inputs,
      expected,
    });
  });
});
