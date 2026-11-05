// Format complete numbers on blur so editing and caret movement remain natural.
export const formatContactPhone = value => {
  if (!value) return '';
  const text = value.trim(), digits = text.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  if (digits.length === 10 && !text.startsWith('+')) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  return text;
};

// Progressive input formatting without truncating international numbers.
export const formatPhoneInput = value => {
  const text = String(value || ''), digits = text.replace(/\D/g, '');
  if (text.startsWith('+') && !digits.startsWith('1')) return text;
  const countryCode = digits.startsWith('1');
  const local = countryCode ? digits.slice(1) : digits;
  if (local.length > 10) return text;
  const prefix = countryCode ? '+1' : '';
  if (!local) return prefix;
  const number = local.length <= 3 ? `(${local}` : local.length <= 6
    ? `(${local.slice(0,3)}) ${local.slice(3)}`
    : `(${local.slice(0,3)}) ${local.slice(3,6)}-${local.slice(6)}`;
  return `${prefix}${prefix ? ' ' : ''}${number}`;
};

export const formatPhoneEdit = (value, previous, caret, inputType = '') => {
  let text = value, position = caret ?? value.length;
  // Backspace/delete on an inserted separator should remove a digit, not trap the cursor.
  if (inputType.startsWith('delete') && value.replace(/\D/g,'') === previous.replace(/\D/g,'')) {
    if (inputType === 'deleteContentBackward') {
      let index = position - 1;
      while (index >= 0 && !/\d/.test(text[index])) index--;
      if (index >= 0) { text = text.slice(0,index) + text.slice(index+1); position = index; }
    } else if (inputType === 'deleteContentForward') {
      let index = position;
      while (index < text.length && !/\d/.test(text[index])) index++;
      if (index < text.length) text = text.slice(0,index) + text.slice(index+1);
    }
  }
  const formatted = formatPhoneInput(text);
  if (formatted === text) return {value:formatted,caret:position};
  const digitsBefore = text.slice(0,position).replace(/\D/g,'').length;
  let nextCaret = 0, seen = 0;
  while (nextCaret < formatted.length && seen < digitsBefore) {
    if (/\d/.test(formatted[nextCaret])) seen++;
    nextCaret++;
  }
  return {value:formatted,caret:nextCaret};
};
