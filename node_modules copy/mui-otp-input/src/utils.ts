export const INPUT_SYMBOL = '_';

export const TypeRegExp = {
  numeric: /^[0-9]$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
};

export enum OTPType {
  numeric = 'number',
  alphanumeric = 'text',
}

export type OTPInputType = 'numeric' | 'alphanumeric';

export enum InputIndexSymbols {
  next = +1,
  prev = -1,
}

export const getNextInputIndex = (
  inputFormat: string[],
  currIndex: number,
  symbol: InputIndexSymbols
): number | null => {
  const nextIndex = currIndex + symbol;
  if (inputFormat[nextIndex] === INPUT_SYMBOL) {
    return nextIndex;
  }
  if (nextIndex === inputFormat.length || nextIndex < 0) {
    return null;
  }
  return getNextInputIndex(inputFormat, nextIndex, symbol);
};

export const getFormattedInputValue = (value: string, format: string): (string | undefined)[] => {
  const inputFormat = format.split('');
  const inputValue = value.split('');
  let inputValueIndex = 0;
  return inputFormat.map(iv => {
    if (iv === INPUT_SYMBOL) {
      inputValueIndex++;
      return inputValue[inputValueIndex - 1];
    }
    return inputValue[inputValueIndex - 1] ? iv : undefined;
  });
};
