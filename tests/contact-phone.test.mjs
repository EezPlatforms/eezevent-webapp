import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneInput, formatPhoneEdit } from '../src/lib/contactPhone.js';

test('phone formats at every stage of typing', () => {
  const expected=['(2','(21','(212','(212) 5','(212) 55','(212) 555','(212) 555-0','(212) 555-01','(212) 555-010','(212) 555-0100'];
  let value='';
  for (const [index,digit] of [...'2125550100'].entries()) {
    const edit=formatPhoneEdit(value+digit,value,value.length+1,'insertText');
    value=edit.value;
    assert.equal(value,expected[index]);
    assert.equal(edit.caret,value.length);
  }
});

test('backspace through digits and separators can clear the field', () => {
  let value='(212) 555-0100';
  while(value) {
    const edit=formatPhoneEdit(value.slice(0,-1),value,value.length-1,'deleteContentBackward');
    assert.ok(edit.value.length < value.length);
    value=edit.value;
  }
});

test('backspace at a formatting boundary removes preceding digit', () => {
  assert.deepEqual(formatPhoneEdit('(212) 5550100','(212) 555-0100',9,'deleteContentBackward'),{value:'(212) 550-100',caret:8});
});

test('mid-number edits keep caret by the edited digit', () => {
  assert.deepEqual(formatPhoneEdit('(212) 5955-0100','(212) 555-0100',8,'insertText'),{value:'(212) 5955-0100',caret:8});
  const edit=formatPhoneEdit('(212) 55-0100','(212) 555-0100',7,'deleteContentBackward');
  assert.equal(edit.value,'(212) 550-100');
  assert.equal(edit.caret,7);
});

test('pasting preserves international and overlong input without dropping digits', () => {
  assert.equal(formatPhoneInput('+44 20 7946 0958'),'+44 20 7946 0958');
  assert.equal(formatPhoneInput('+3312345678'),'+3312345678');
  assert.equal(formatPhoneInput('212555010099'),'212555010099');
  assert.equal(formatPhoneInput('+12125550100'),'+1 (212) 555-0100');
  assert.equal(formatPhoneInput('12125550100'),'+1 (212) 555-0100');
});
