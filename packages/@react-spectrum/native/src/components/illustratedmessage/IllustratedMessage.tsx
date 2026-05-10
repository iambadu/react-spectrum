import React from 'react';
import type {ReactNode} from 'react';
import {Text, View} from '../../primitives';
import {cn} from '../../styles/cn';
import {Heading} from '../text/Heading';

export interface IllustratedMessageProps {
  children?: ReactNode;
  className?: string;
  illustration?: ReactNode;
  testID?: string;
  title?: ReactNode;
}

export function IllustratedMessage({
  children,
  className,
  illustration,
  testID,
  title
}: IllustratedMessageProps) {
  return (
    <View
      accessibilityRole="summary"
      className={cn('items-center gap-200 px-400 py-600', className)}
      testID={testID}>
      {illustration != null && (
        <View
          accessibilityElementsHidden
          className="mb-100"
          importantForAccessibility="no-hide-descendants">
          {illustration}
        </View>
      )}
      {title != null && (
        typeof title === 'string' ? (
          <Heading className="text-center" level={3}>
            {title}
          </Heading>
        ) : (
          title
        )
      )}
      {children != null && (
        typeof children === 'string' ? (
          <Text className="text-center text-200 text-textMuted">{children}</Text>
        ) : (
          children
        )
      )}
    </View>
  );
}
