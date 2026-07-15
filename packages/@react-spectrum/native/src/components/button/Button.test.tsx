import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Button} from './Button';

describe('Button', () => {
  it('renders text children', () => {
    let {getByTestId} = renderWithProvider(
      <Button testID="btn" variant="accent">
        Save
      </Button>
    );
    let host = getByTestId('btn');
    expect(host.props.accessibilityRole).toBe('button');
  });

  it('fires onPress', () => {
    let onPress = jest.fn();
    let {getByTestId} = renderWithProvider(
      <Button onPress={onPress} testID="btn" variant="accent">
        Save
      </Button>
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    let onPress = jest.fn();
    let {getByTestId} = renderWithProvider(
      <Button isDisabled onPress={onPress} testID="btn" variant="accent">
        Save
      </Button>
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByTestId('btn').props.accessibilityState.disabled).toBe(true);
  });

  it('reflects pending in accessibilityState.busy', () => {
    jest.useFakeTimers();
    try {
      let {getByTestId, unmount} = renderWithProvider(
        <Button isPending testID="btn" variant="accent">
          Save
        </Button>
      );
      expect(getByTestId('btn').props.accessibilityState.busy).toBe(true);
      unmount();
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not fire onPress while pending', () => {
    let onPress = jest.fn();
    let {getByTestId} = renderWithProvider(
      <Button isPending onPress={onPress} testID="btn" variant="accent">
        Save
      </Button>
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByTestId('btn').props.accessibilityState.disabled).toBe(true);
  });

  it('adds pending context to an explicit accessibility label', () => {
    let {getByTestId} = renderWithProvider(
      <Button accessibilityLabel="Save changes" isPending testID="btn" variant="accent">
        Save
      </Button>
    );
    expect(getByTestId('btn').props.accessibilityLabel).toBe('Save changes Pending');
  });
});
