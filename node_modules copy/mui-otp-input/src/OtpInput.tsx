import * as React from 'react';
import NumericInput from './NumericInput';
import { useInputFormat } from './useInputFormat';
import { INPUT_SYMBOL, OTPInputType } from './utils';

type OtpInputProps = {
  format: string;
  value: string;
  type?: OTPInputType;
  isSecure?: boolean;
  isDisabled?: boolean;
  onChange: (value: string, formattedValue: string) => void;
};

export const OtpInput: React.FC<OtpInputProps> = ({
  format,
  value,
  type = 'numeric',
  isSecure = false,
  isDisabled = false,
  onChange,
}) => {
  const {
    inputFormat,
    inputFormattedValue,
    activeIndex,
    onInputFocus,
    nextActiveInputIndex,
    changeValueAtActiveIndex,
    getInputValueFromFormattedValue,
  } = useInputFormat(format, value);

  const changeValue = (newValue: string) => onChange(getInputValueFromFormattedValue(newValue), newValue);

  const handleChange = (val: string) => {
    changeValue(changeValueAtActiveIndex(val));
    nextActiveInputIndex(+1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        changeValue(changeValueAtActiveIndex(''));
        nextActiveInputIndex(-1);
        break;
      }
      case 'Delete': {
        event.preventDefault();
        changeValue(changeValueAtActiveIndex(''));
        break;
      }
      default:
        break;
    }
  };

  /**
   * [TODO]: Implment handle paste
   */
  const handlePaste = React.useCallback(() => {}, []);


  return (
    <>
      {inputFormat.map((item, index) => {
        if (item === INPUT_SYMBOL) {
          return (
            <NumericInput
              key={index}
              index={index}
              type={type}
              isSecure={isSecure}
              isDisabled={isDisabled}
              value={inputFormattedValue[index] ?? ''}
              focus={activeIndex === index}
              onKeyDown={handleKeyDown}
              onInputPaste={handlePaste}
              onChange={handleChange}
              onInputFocus={onInputFocus}
            />
          );
        }

        return <span key={index}>{item}</span>;
      })}
    </>
  );
};

export default OtpInput;
