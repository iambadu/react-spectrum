import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Radio} from './Radio';
import {RadioGroup} from './RadioGroup';

function findRadio(root: any, testID: string) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.testID === testID
  )[0];
}

describe('RadioGroup', () => {
  it('selects radio on press', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <RadioGroup label="Choose" onChange={onChange}>
        <Radio testID="a" value="a">
          A
        </Radio>
        <Radio testID="b" value="b">
          B
        </Radio>
      </RadioGroup>
    );
    fireEvent.press(findRadio(root, 'b'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('reflects selected accessibilityState', () => {
    let {root} = renderWithProvider(
      <RadioGroup label="Choose" value="a">
        <Radio testID="a" value="a">
          A
        </Radio>
      </RadioGroup>
    );
    expect(findRadio(root, 'a').props.accessibilityState.checked).toBe(true);
  });

  it('propagates aria-invalid to the group and radios', () => {
    let {root} = renderWithProvider(
      <RadioGroup isInvalid label="Choose" testID="group" value="a">
        <Radio testID="a" value="a">
          A
        </Radio>
      </RadioGroup>
    );
    let group = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'group'
    )[0];
    expect(group.props['aria-invalid']).toBe(true);
    expect(findRadio(root, 'a').props['aria-invalid']).toBe(true);
  });
});
