import React from 'react';
import {fireEvent, renderWithProvider} from '../test-utils/renderWithProvider';
import {Pressable} from './Pressable';

describe('Pressable primitive', () => {
  it('fires onPress when not disabled', () => {
    let onPress = jest.fn();
    let {getByTestId} = renderWithProvider(
      <Pressable onPress={onPress} testID="press" />
    );
    fireEvent.press(getByTestId('press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks accessibilityState.disabled when disabled', () => {
    let {getByTestId} = renderWithProvider(
      <Pressable isDisabled testID="press" />
    );
    expect(getByTestId('press').props.accessibilityState.disabled).toBe(true);
  });

  it('inherits isDisabled from Provider', () => {
    let {getByTestId} = renderWithProvider(
      <Pressable testID="press" />,
      {providerProps: {isDisabled: true}}
    );
    expect(getByTestId('press').props.disabled).toBe(true);
  });

  it('opacity-disabled class applied when disabled', () => {
    let {getByTestId} = renderWithProvider(
      <Pressable isDisabled testID="press" />
    );
    expect(getByTestId('press').props.className).toContain('opacity-disabled');
  });

  it('resolves style props without forwarding raw style prop keys', () => {
    let {getByTestId} = renderWithProvider(
      <Pressable margin="400" testID="press" width={100} />
    );
    let press = getByTestId('press');
    expect(press.props.margin).toBeUndefined();
    expect(press.props.width).toBeUndefined();
    expect(press.props.style[0]).toMatchObject({margin: 16, width: 100});
  });
});
