import assert from 'node:assert/strict';
import test from 'node:test';
import { getContrastRatio } from '@mui/material/styles';
import { createEezEventTheme } from '../src/theme.js';

const components = ['MuiOutlinedInput', 'MuiInput', 'MuiFilledInput', 'MuiFormLabel'];
test('dark primary focus indicators use a readable color and preserve error and disabled states', () => {
  const theme = createEezEventTheme('dark');
  assert.ok(getContrastRatio(theme.palette.primary.light, theme.palette.background.paper) >= 3);
  for (const name of components) {
    const styles = theme.components[name].styleOverrides.root({ theme, ownerState: { color: 'primary' } });
    const [selector, properties] = Object.entries(styles)[0];
    assert.ok(selector.includes('.Mui-focused'));
    assert.ok(selector.includes(':not(.Mui-error):not(.Mui-disabled)'));
    assert.equal(Object.values(properties)[0], theme.palette.primary.light);
  }
});
test('light mode and non-primary field colors keep their existing focus styles', () => {
  for (const name of components) {
    const theme = createEezEventTheme('light');
    assert.deepEqual(theme.components[name].styleOverrides.root({ theme, ownerState: { color: 'primary' } }), {});
    const dark = createEezEventTheme('dark');
    for (const color of ['error', 'success', 'secondary']) {
      assert.deepEqual(dark.components[name].styleOverrides.root({ theme: dark, ownerState: { color } }), {});
    }
  }
});
