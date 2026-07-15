import React, {useCallback, useMemo, useRef} from 'react';
import {type AccessibilityActionEvent, type LayoutChangeEvent} from 'react-native';
import {useSliderState, type SliderProps} from '@react-stately/slider';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';

function getSingleValue(value: number | number[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getRangeValue(value: number | number[]): [number, number] {
  return Array.isArray(value) ? [value[0], value[1]] : [value, value];
}

export interface NativeSliderProps
  extends Omit<SliderProps<number>, 'label' | 'onChange' | 'onChangeEnd'> {
  'aria-label'?: string;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  isDisabled?: boolean;
  label?: React.ReactNode;
  locale?: string;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  showValueLabel?: boolean;
  testID?: string;
}

export function Slider(rawProps: NativeSliderProps) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    className,
    formatOptions,
    isDisabled,
    label,
    locale,
    onChange,
    onChangeEnd,
    showValueLabel = true,
    testID,
    ...sliderProps
  } = props;

  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);

  let numberFormatter = useMemo(
    () => new Intl.NumberFormat(resolvedLocale, formatOptions),
    [resolvedLocale, formatOptions]
  );

  let state = useSliderState({
    ...sliderProps,
    isDisabled: resolvedDisabled,
    numberFormatter,
    onChange(values) {
      onChange?.(getSingleValue(values));
    },
    onChangeEnd(values) {
      onChangeEnd?.(getSingleValue(values));
    }
  });

  let min = sliderProps.minValue ?? 0;
  let max = sliderProps.maxValue ?? 100;
  let current = state.values[0];
  let range = max - min || 1;
  let percent = Math.max(0, Math.min(1, (current - min) / range));
  let trackWidthRef = useRef(0);

  let handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidthRef.current = event.nativeEvent.layout.width;
      state.setThumbEditable(0, true);
    },
    [state]
  );

  let updateValueFromLocation = useCallback(
    (locationX: number) => {
      if (resolvedDisabled) {
        return;
      }
      let trackWidth = trackWidthRef.current;
      if (trackWidth <= 0) {
        return;
      }
      let nextPercent = Math.max(0, Math.min(1, locationX / trackWidth));
      state.setThumbValue(0, min + nextPercent * range);
    },
    [min, range, resolvedDisabled, state]
  );

  let handleGrant = useCallback(
    (event: {nativeEvent: {locationX?: number}}) => {
      if (resolvedDisabled) {
        return;
      }
      state.setThumbDragging(0, true);
      updateValueFromLocation(event.nativeEvent.locationX ?? percent * trackWidthRef.current);
    },
    [percent, resolvedDisabled, state, updateValueFromLocation]
  );

  let handleMove = useCallback(
    (event: {nativeEvent: {locationX?: number}}) => {
      if (event.nativeEvent.locationX != null) {
        updateValueFromLocation(event.nativeEvent.locationX);
      }
    },
    [updateValueFromLocation]
  );

  let handleRelease = useCallback(() => {
    state.setThumbDragging(0, false);
  }, [state]);

  let responderHandlers = useMemo(
    () => ({
      onMoveShouldSetResponder: () => !resolvedDisabled,
      onResponderGrant: handleGrant,
      onResponderMove: handleMove,
      onResponderRelease: handleRelease,
      onResponderTerminate: handleRelease,
      onStartShouldSetResponder: () => !resolvedDisabled
    }),
    [handleGrant, handleMove, handleRelease, resolvedDisabled]
  );

  let handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'increment') {
        state.incrementThumb(0, state.step);
      } else if (event.nativeEvent.actionName === 'decrement') {
        state.decrementThumb(0, state.step);
      }
    },
    [state]
  );

  let displayValue = numberFormatter.format(current);

  return (
    <View className={cn('gap-200', className)} testID={testID}>
      {(label != null || showValueLabel) && (
        <View className="flex-row items-center justify-between">
          {label != null && (
            <Text className="text-200 font-medium text-text">
              {typeof label === 'string' ? label : label}
            </Text>
          )}
          {showValueLabel && (
            <Text className="text-200 text-textMuted">{displayValue}</Text>
          )}
        </View>
      )}
      <View
        accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
        onAccessibilityAction={handleAccessibilityAction}
        accessibilityRole="adjustable"
        accessibilityValue={{
          max,
          min,
          now: current,
          text: displayValue
        }}
        className={cn('h-400 justify-center', resolvedDisabled && 'opacity-disabled')}
        onLayout={handleTrackLayout}
        {...responderHandlers}
        testID={testID ? `${testID}-track` : undefined}>
        <View className="h-50 w-full rounded-full bg-border">
          <View
            className="h-full rounded-full bg-accent"
            style={{width: `${percent * 100}%`}}
          />
        </View>
        <View
          className="absolute h-1000 w-1000 -translate-y-[50%] items-center justify-center rounded-full border-2 border-accent bg-surface shadow-sm"
          style={{left: `${percent * 100}%`, top: '50%'}}
          testID={testID ? `${testID}-thumb` : undefined}
        />
      </View>
    </View>
  );
}

export interface NativeRangeSliderProps
  extends Omit<SliderProps<number[]>, 'label' | 'onChange' | 'onChangeEnd'> {
  'aria-label'?: string;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  isDisabled?: boolean;
  label?: React.ReactNode;
  locale?: string;
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
  showValueLabel?: boolean;
  testID?: string;
}

export function RangeSlider(rawProps: NativeRangeSliderProps) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    className,
    formatOptions,
    isDisabled,
    label,
    locale,
    onChange,
    onChangeEnd,
    showValueLabel = true,
    testID,
    ...sliderProps
  } = props;

  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);

  let numberFormatter = useMemo(
    () => new Intl.NumberFormat(resolvedLocale, formatOptions),
    [resolvedLocale, formatOptions]
  );

  let state = useSliderState({
    ...sliderProps,
    isDisabled: resolvedDisabled,
    numberFormatter,
    onChange(values) {
      onChange?.(getRangeValue(values));
    },
    onChangeEnd(values) {
      onChangeEnd?.(getRangeValue(values));
    }
  });

  let min = sliderProps.minValue ?? 0;
  let max = sliderProps.maxValue ?? 100;
  let startVal = state.values[0];
  let endVal = state.values[1] ?? max;
  let range = max - min || 1;
  let startPercent = Math.max(0, Math.min(1, (startVal - min) / range));
  let endPercent = Math.max(0, Math.min(1, (endVal - min) / range));
  let trackWidthRef = useRef(0);
  let activeThumbRef = useRef(0);

  let handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidthRef.current = event.nativeEvent.layout.width;
      state.setThumbEditable(0, true);
      state.setThumbEditable(1, true);
    },
    [state]
  );

  let updateValueFromLocation = useCallback(
    (locationX: number) => {
      if (resolvedDisabled) {
        return;
      }
      let trackWidth = trackWidthRef.current;
      if (trackWidth <= 0) {
        return;
      }
      let nextPercent = Math.max(0, Math.min(1, locationX / trackWidth));
      state.setThumbValue(activeThumbRef.current, min + nextPercent * range);
    },
    [min, range, resolvedDisabled, state]
  );

  let handleGrant = useCallback(
    (event: {nativeEvent: {locationX?: number}}) => {
      if (resolvedDisabled) {
        return;
      }
      let locationX = event.nativeEvent.locationX ?? 0;
      let trackWidth = trackWidthRef.current || 1;
      let startX = startPercent * trackWidth;
      let endX = endPercent * trackWidth;
      activeThumbRef.current =
        Math.abs(locationX - startX) <= Math.abs(locationX - endX) ? 0 : 1;
      state.setThumbDragging(activeThumbRef.current, true);
      updateValueFromLocation(locationX);
    },
    [endPercent, resolvedDisabled, startPercent, state, updateValueFromLocation]
  );

  let handleMove = useCallback(
    (event: {nativeEvent: {locationX?: number}}) => {
      if (event.nativeEvent.locationX != null) {
        updateValueFromLocation(event.nativeEvent.locationX);
      }
    },
    [updateValueFromLocation]
  );

  let handleRelease = useCallback(() => {
    state.setThumbDragging(activeThumbRef.current, false);
  }, [state]);

  let responderHandlers = useMemo(
    () => ({
      onMoveShouldSetResponder: () => !resolvedDisabled,
      onResponderGrant: handleGrant,
      onResponderMove: handleMove,
      onResponderRelease: handleRelease,
      onResponderTerminate: handleRelease,
      onStartShouldSetResponder: () => !resolvedDisabled
    }),
    [handleGrant, handleMove, handleRelease, resolvedDisabled]
  );

  let handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'increment') {
        state.incrementThumb(0, state.step);
      } else if (event.nativeEvent.actionName === 'decrement') {
        state.decrementThumb(0, state.step);
      }
    },
    [state]
  );

  let displayValue = `${numberFormatter.format(startVal)} – ${numberFormatter.format(endVal)}`;

  return (
    <View className={cn('gap-200', className)} testID={testID}>
      {(label != null || showValueLabel) && (
        <View className="flex-row items-center justify-between">
          {label != null && (
            <Text className="text-200 font-medium text-text">
              {typeof label === 'string' ? label : label}
            </Text>
          )}
          {showValueLabel && (
            <Text className="text-200 text-textMuted">{displayValue}</Text>
          )}
        </View>
      )}
      <View
        accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
        onAccessibilityAction={handleAccessibilityAction}
        accessibilityRole="adjustable"
        accessibilityValue={{max, min, now: startVal, text: displayValue}}
        className={cn('h-400 justify-center', resolvedDisabled && 'opacity-disabled')}
        onLayout={handleTrackLayout}
        {...responderHandlers}
        testID={testID ? `${testID}-track` : undefined}>
        <View className="h-50 w-full rounded-full bg-border">
          <View
            className="absolute h-full rounded-full bg-accent"
            style={{
              left: `${startPercent * 100}%`,
              width: `${(endPercent - startPercent) * 100}%`
            }}
          />
        </View>
        <View
          className="absolute h-1000 w-1000 -translate-y-[50%] items-center justify-center rounded-full border-2 border-accent bg-surface shadow-sm"
          style={{left: `${startPercent * 100}%`, top: '50%'}}
          testID={testID ? `${testID}-thumb-start` : undefined}
        />
        <View
          className="absolute h-1000 w-1000 -translate-y-[50%] items-center justify-center rounded-full border-2 border-accent bg-surface shadow-sm"
          style={{left: `${endPercent * 100}%`, top: '50%'}}
          testID={testID ? `${testID}-thumb-end` : undefined}
        />
      </View>
    </View>
  );
}
