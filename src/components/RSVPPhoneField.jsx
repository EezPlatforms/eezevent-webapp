"use client";
import { useLayoutEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { formatContactPhone, formatPhoneEdit } from '../lib/contactPhone';

export default function RSVPPhoneField({ value, onChange }) {
  const input = useRef(null), pendingCaret = useRef(null);
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && input.current) {
      input.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  });
  return <TextField label="Phone number" type="tel" autoComplete="tel" placeholder="(212) 555-0100"
    InputLabelProps={{shrink:true}} inputRef={input} value={value}
    inputProps={{maxLength:32}} helperText="International numbers may include a country code."
    onBlur={() => onChange(formatContactPhone(value))}
    onChange={event => {
      const edit = formatPhoneEdit(event.target.value, value, event.target.selectionStart, event.nativeEvent.inputType);
      pendingCaret.current = edit.caret;
      onChange(edit.value);
    }}/>;
}
