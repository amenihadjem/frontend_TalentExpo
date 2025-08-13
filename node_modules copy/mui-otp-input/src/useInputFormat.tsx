import * as React from 'react';
import {
  getFormattedInputValue,
  getNextInputIndex,
  InputIndexSymbols,
  INPUT_SYMBOL,
} from './utils';

export const useInputFormat = (format: string, value: string) => {
  const [activeIndex, setActiveIndex] = React.useState<number>(
    format.indexOf(INPUT_SYMBOL)
  );

  const activeIndexRef = React.useRef<number>(activeIndex);

  activeIndexRef.current = activeIndex;

  const inputFormat = format.split('');
  const inputFormattedValueRef = React.useRef(
    getFormattedInputValue(value, format)
  );

  inputFormattedValueRef.current = getFormattedInputValue(value, format);

  const formattingCharacters = format.replace(/_/g, '');

  const getInputValueFromFormattedValue = (
    formattedValue: string | string[]
  ): string => {
    const tempFormattedValue =
      formattedValue instanceof Array
        ? formattedValue
        : formattedValue.split('');
    return tempFormattedValue
      .map(iv => (!formattingCharacters.includes(iv) ? iv : ''))
      .join('');
  };

  const changeValueAtActiveIndex = (value: string) => {
    const newInputValue = [...inputFormattedValueRef.current];
    newInputValue[activeIndexRef.current] = value;
    return newInputValue.join('');
  };

  const nextActiveInputIndex = React.useCallback(
    (symbol: InputIndexSymbols) => {
      setActiveIndex(i => {
        const nextIndex = getNextInputIndex(inputFormat, i, symbol);
        if (nextIndex !== null) {
          return nextIndex;
        }
        return i;
      });
    },
    [inputFormat]
  );

  const onInputFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>, index: number) => {
      setActiveIndex(index);
      event.target.select();
    },
    []
  );

  if (!format.includes('_')) {
    throw new Error(
      'Format must contain "_" because it represents and input field, e.g. "__/__/____"'
    );
  }

  return {
    inputFormat,
    inputFormattedValue: inputFormattedValueRef.current,
    activeIndex,
    onInputFocus,
    nextActiveInputIndex,
    changeValueAtActiveIndex,
    getInputValueFromFormattedValue,
  };
};
