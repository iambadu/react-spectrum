import React from 'react';
import type {ReactNode} from 'react';
import {Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type LabeledValueOrientation = 'horizontal' | 'vertical';

export interface LabeledValueProps {
  className?: string;
  label?: ReactNode;
  orientation?: LabeledValueOrientation;
  testID?: string;
  value?: ReactNode;
}

export function LabeledValue({
  className,
  label,
  orientation = 'vertical',
  testID,
  value
}: LabeledValueProps) {
  return (
    <View
      className={cn(
        orientation === 'horizontal'
          ? 'flex-row items-baseline justify-between gap-300'
          : 'gap-50',
        className
      )}
      testID={testID}>
      {label != null && (
        <Text className="text-100 font-medium text-textMuted">
          {label}
        </Text>
      )}
      {value != null && (
        typeof value === 'string' || typeof value === 'number' ? (
          <Text className="text-200 text-text">{value}</Text>
        ) : (
          value
        )
      )}
    </View>
  );
}
