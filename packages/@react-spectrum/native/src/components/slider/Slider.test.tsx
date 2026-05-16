import React from 'react';
import {act} from 'react-test-renderer';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {RangeSlider, Slider} from './Slider';

function findByTestId(root: any, testID: string) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props?.testID === testID
  )[0];
}

describe('Slider', () => {
  it('renders with adjustable role', () => {
    let {root} = renderWithProvider(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        maxValue={100}
        minValue={0}
        testID="sl"
      />
    );
    let track = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'sl-track'
    )[0];
    expect(track.props.accessibilityRole).toBe('adjustable');
    expect(track.props.accessibilityValue.now).toBe(50);
  });

  it('shows label and value', () => {
    let {root} = renderWithProvider(
      <Slider
        defaultValue={30}
        label="Brightness"
        maxValue={100}
        minValue={0}
        showValueLabel
        testID="sl"
      />
    );
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Brightness'
    )[0];
    expect(labelNode).toBeDefined();
    let valueLabel = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === '30'
    )[0];
    expect(valueLabel).toBeDefined();
  });

  it('updates value from track drag and fires change lifecycle callbacks', () => {
    let onChange = jest.fn();
    let onChangeEnd = jest.fn();
    let {root} = renderWithProvider(
      <Slider
        aria-label="Volume"
        defaultValue={0}
        maxValue={100}
        minValue={0}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        testID="sl"
      />
    );
    let track = findByTestId(root, 'sl-track');

    act(() => {
      track.props.onLayout({nativeEvent: {layout: {width: 200}}});
      track.props.onResponderGrant({nativeEvent: {locationX: 100}});
      track.props.onResponderMove({nativeEvent: {locationX: 150}});
      track.props.onResponderRelease();
    });

    expect(onChange).toHaveBeenLastCalledWith(75);
    expect(onChangeEnd).toHaveBeenLastCalledWith(75);
    track = findByTestId(root, 'sl-track');
    expect(track.props.accessibilityValue.now).toBe(75);
  });

  it('does not update disabled slider drag', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <Slider
        aria-label="Volume"
        defaultValue={20}
        isDisabled
        maxValue={100}
        minValue={0}
        onChange={onChange}
        testID="sl"
      />
    );
    let track = findByTestId(root, 'sl-track');

    act(() => {
      track.props.onLayout({nativeEvent: {layout: {width: 200}}});
      track.props.onResponderGrant({nativeEvent: {locationX: 180}});
      track.props.onResponderMove({nativeEvent: {locationX: 200}});
      track.props.onResponderRelease();
    });

    expect(onChange).not.toHaveBeenCalled();
    track = findByTestId(root, 'sl-track');
    expect(track.props.accessibilityValue.now).toBe(20);
  });

  it('supports accessibility increment and decrement actions', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        maxValue={100}
        minValue={0}
        onChange={onChange}
        step={10}
        testID="sl"
      />
    );
    let track = findByTestId(root, 'sl-track');

    act(() => {
      track.props.onLayout({nativeEvent: {layout: {width: 200}}});
      track.props.onAccessibilityAction({nativeEvent: {actionName: 'increment'}});
    });
    expect(onChange).toHaveBeenLastCalledWith(60);

    track = findByTestId(root, 'sl-track');
    act(() => {
      track.props.onAccessibilityAction({nativeEvent: {actionName: 'decrement'}});
    });
    expect(onChange).toHaveBeenLastCalledWith(50);
  });
});

describe('RangeSlider', () => {
  it('renders with adjustable role and range value', () => {
    let {root} = renderWithProvider(
      <RangeSlider
        aria-label="Price range"
        defaultValue={[20, 80]}
        maxValue={100}
        minValue={0}
        testID="rs"
      />
    );
    let track = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'rs-track'
    )[0];
    expect(track.props.accessibilityRole).toBe('adjustable');
    expect(track.props.accessibilityValue.now).toBe(20);
  });

  it('updates the closest thumb on drag', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <RangeSlider
        aria-label="Price range"
        defaultValue={[20, 80]}
        maxValue={100}
        minValue={0}
        onChange={onChange}
        testID="rs"
      />
    );
    let track = findByTestId(root, 'rs-track');

    act(() => {
      track.props.onLayout({nativeEvent: {layout: {width: 200}}});
      track.props.onResponderGrant({nativeEvent: {locationX: 150}});
      track.props.onResponderMove({nativeEvent: {locationX: 120}});
      track.props.onResponderRelease();
    });

    expect(onChange).toHaveBeenLastCalledWith([20, 60]);
  });
});
