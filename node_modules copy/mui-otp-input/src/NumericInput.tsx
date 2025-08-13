import { Input as MuiInput, styled } from '@mui/material';
import * as React from 'react';
import { OTPInputType, OTPType, TypeRegExp } from './utils';

type NumericInputProps = {
  value: string;
  focus: boolean;
  index: number;
  type: OTPInputType;
  isSecure?: boolean;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onInputPaste: () => void;
  onInputFocus: (
    event: React.FocusEvent<HTMLInputElement>,
    index: number
  ) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

const Input = styled(MuiInput)({
  width: '30px',
  height: '30px',
  margin: '0 5px',
  '& > input': {
    textAlign: 'center',
  },
  '& > input[type=number]::-webkit-inner-spin-button': { 
    '-webkit-appearance': 'none'
  }
});

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  focus,
  index,
  type,
  isSecure = false,
  isDisabled,
  onChange,
  onKeyDown,
  onInputPaste,
  onInputFocus,
}) => {
  const inputRef = React.useRef<HTMLInputElement>();

  const inputType = isSecure ? 'password' : OTPType[type];

  React.useEffect(() => {
    const inputEl = inputRef.current;
    if (focus && inputEl) {
      inputEl.focus();
    }
  }, [focus]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const val = event.target.value;
      if (TypeRegExp[type].test(val[0])) {
      onChange(val[0]);
      }
    },
    [type]
  );

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => onInputFocus(event, index),
    [index]
  );

  return (
    <Input
      type={inputType}
      inputRef={inputRef}
      value={value}
      disabled={isDisabled}
      onKeyDown={onKeyDown}
      onChange={handleChange}
      onPaste={onInputPaste}
      onFocus={handleFocus}
      inputProps={{ maxLength: 1 }}
    />
  );
};

export default NumericInput;
