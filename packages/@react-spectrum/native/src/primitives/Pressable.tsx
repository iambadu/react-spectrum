import React, {forwardRef} from 'react';
import {Pressable as RNPressable, type PressableProps} from 'react-native';
import {useProvider} from '../provider';
import {cn} from '../styles/cn';
import {omitNativeStyleProps, resolveStyleProps} from '../styles/styleProps';
import type {SpectrumPressableProps} from './types';

const UniwindPressable = RNPressable as any;

export const Pressable = forwardRef<React.ElementRef<typeof RNPressable>, SpectrumPressableProps>(
  function Pressable(props, ref) {
    let {children, className, disabled, isDisabled, style, ...otherProps} = props;
    let provider = useProvider();
    let resolvedDisabled = disabled || isDisabled || provider.isDisabled;
    let resolvedStyle = resolveStyleProps(otherProps, provider);
    let safeOtherProps = omitNativeStyleProps(otherProps);

    return (
      <UniwindPressable
        {...safeOtherProps}
        accessibilityState={{
          ...safeOtherProps.accessibilityState,
          disabled: resolvedDisabled || undefined
        }}
        className={cn(resolvedDisabled && 'opacity-disabled', className)}
        disabled={resolvedDisabled}
        ref={ref}
        style={[resolvedStyle, style] as any}>
        {children}
      </UniwindPressable>
    );
  }
);
