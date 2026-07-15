import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {SearchField, TextArea, TextField} from './TextField';

function findInput(root: any) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'text'
  )[0];
}

function findClearButton(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.accessibilityLabel === 'Clear search'
  )[0];
}

describe('TextField', () => {
  it('renders TextInput with provided value', () => {
    let {root} = renderWithProvider(<TextField label="Name" value="Alice" />);
    expect(findInput(root).props.value).toBe('Alice');
  });

  it('updates uncontrolled value via onChangeText', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<TextField label="Name" onChange={onChange} />);
    let input = findInput(root);
    fireEvent(input, 'onChangeText', 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('does not update controlled value internally', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <TextField label="Name" onChange={onChange} value="Alice" />
    );
    let input = findInput(root);
    fireEvent(input, 'onChangeText', 'Bob');
    expect(onChange).toHaveBeenCalledWith('Bob');
    expect(findInput(root).props.value).toBe('Alice');
  });

  it('marks editable false when disabled', () => {
    let {root} = renderWithProvider(<TextField isDisabled label="Name" />);
    expect(findInput(root).props.editable).toBe(false);
  });

  it('marks editable false when readOnly', () => {
    let {root} = renderWithProvider(<TextField isReadOnly label="Name" />);
    expect(findInput(root).props.editable).toBe(false);
  });

  it('reports invalid via aria-invalid', () => {
    let {root} = renderWithProvider(<TextField isInvalid label="Name" />);
    expect(findInput(root).props['aria-invalid']).toBe(true);
  });

  it('inherits disabled state from Provider', () => {
    let {root} = renderWithProvider(
      <TextField label="Name" />,
      {providerProps: {isDisabled: true}}
    );
    expect(findInput(root).props.editable).toBe(false);
    expect(findInput(root).props.accessibilityState.disabled).toBe(true);
  });
});

describe('TextArea', () => {
  it('sets multiline=true', () => {
    let {root} = renderWithProvider(<TextArea label="Bio" />);
    expect(findInput(root).props.multiline).toBe(true);
  });
});

describe('SearchField', () => {
  it('uses search returnKeyType', () => {
    let {root} = renderWithProvider(<SearchField label="Search" />);
    expect(findInput(root).props.returnKeyType).toBe('search');
  });

  it('uses native search keyboard defaults', () => {
    let {root} = renderWithProvider(<SearchField label="Search" />);
    expect(findInput(root).props.autoCapitalize).toBe('none');
    expect(findInput(root).props.textContentType).toBe('none');
  });

  it('clears uncontrolled value and calls onClear', () => {
    let onChange = jest.fn();
    let onClear = jest.fn();
    let {root} = renderWithProvider(
      <SearchField defaultValue="query" label="Search" onChange={onChange} onClear={onClear} />
    );
    fireEvent.press(findClearButton(root));
    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(findInput(root).props.value).toBe('');
  });
});
